import { useState, ChangeEvent, MouseEvent, useEffect, useRef } from 'react';
import JumpDiffusion from '../lib/jumpDiffusion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  );

interface InputFieldProps {
  name: string;
  value: number;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  theme: string;
}

interface Params {
  S0: number;
  mu: number;
  sigma: number;
  muJ: number;
  sigmaJ: number;
  lambda: number;
  T: number;
  dt: number;
}

const Simulation = () => {
  // load data from csv
  const [csvData, setCsvData] = useState<Array<{date: string, close: number}>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event!.target!.files![0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom')
        .then((module:any) => {
          ChartJS.register(module)
        })
        .catch((err) => {
          console.error('Failed to load chartjs-plugin-zoom', err);
        });
    }
  }, []);


  // create data
  const [params, setParams] = useState<Params>({
    S0: 1800,
    mu: 0.02,
    sigma: 0.1,
    muJ: -0.02,
    sigmaJ: 0.15,
    lambda: 0.1,
    T: 1,
    dt: 100,
  });
  const [results, setResults] = useState<number[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setParams(prevParams => ({ ...prevParams, [name]: Number(value) }));
  };

  const runSimulation = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const jd = new JumpDiffusion(params.S0, params.mu, params.sigma, params.muJ, params.sigmaJ, params.lambda);
    const path = jd.simulate(params.T, 1/params.dt);

    setResults(path);
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }},
      y: { grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }},
    },
    elements:{
      point:{
          borderWidth: 0,
          radius: 10,
          backgroundColor: 'rgba(0,0,0,0)'
      }
    },
    animation: {
      duration: 0
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          drag: {
            enabled: true
          },
          mode: 'xy' as const,
          sensitivity: 0.5
        }
      }
    }
  };  

  
  const data = {
    labels: results.map((_, index) => index),
    datasets: [
      {
        label: 'Token Price',
        data: results,
        backgroundColor: 'rgba(51, 153, 255, 0)',
        borderColor: 'rgba(51, 153, 255, 0.8)',
        tension: 0.3,
        // borderDash: [5, 5],
        fill: {
          target: "origin",
          above: "rgba(51, 153, 255, 0.3)"
        }
      },
    ],
  };

  const scrollToBottom = () => {

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };
  useEffect(() => {
    scrollToBottom()
  },[results])

  const testBackend = () => {

    let socket = new WebSocket("ws://localhost:8080");

    socket.onopen = function(e) {
      console.log("[open] Connection established");
      console.log("Sending to server");

      let params = {
        command: "aave",
        arg1: "value1",
        arg2: "value2"
      };

      socket.send(JSON.stringify(params));
    };

    socket.onmessage = function(event) {
      console.log(`[message] Data received from server: ${event.data}`);
    };

    socket.onerror = function(error) {
      console.log(`[error] ${error}`);
    };
  }
  
  return (
    <div className={`p-8 min-h-screen space-y-4 pb-16 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex justify-between items-center">
        <button onClick={testBackend} >TEST BACKEND</button>
        <h2 className="text-2xl font-bold">Jump-Diffusion Price Simulation</h2>
        <button onClick={toggleTheme} className={`px-4 py-2 rounded ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</button>
      </div>
      <form className="space-y-2">
        <div className={`p-4 mb-2 rounded shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Parameters</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.keys(params).map(key => (
              <InputField key={key} name={key} value={params[key as keyof Params]} handleInputChange={handleInputChange} theme={theme} />
            ))}
          </div>
        </div>
        <button onClick={runSimulation} className="px-4 py-2 bg-blue-500 text-white rounded">Run Simulation</button>
      </form>
      {results.length > 0 &&
        <div className='h-80 lg:h-[620px]'>
          <h2 className="text-2xl font-bold mt-10">Simulation Result</h2>
          <Line data={data} options={chartOptions} />
        </div>
      }
    </div>
  );
};


const InputField: React.FC<InputFieldProps> = ({ name, value, handleInputChange, theme }) => (
  <div>
    <label className={`block text-sm font-medium text- ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} `}>{name}:</label>
    <input
      type="number"
      name={name}
      value={value.toString()}
      onChange={handleInputChange}
      className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-transparent focus:border-gray-500 focus:ring-0`}
    />
  </div>
);


export default Simulation;