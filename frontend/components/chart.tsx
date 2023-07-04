import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState, ChangeEvent, MouseEvent, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
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
import { useTheme } from "next-themes";

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

export function Chart({ data }: any) {

    // load data from csv
    const [csvData, setCsvData] = useState<Array<{date: string, close: number}>>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { theme, setTheme } = useTheme();
  
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
        legend: {
          display: false // add this
        },
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
  
    // const scrollToBottom = () => {
  
    //   window.scrollTo({
    //     top: document.documentElement.scrollHeight,
    //     behavior: 'smooth',
    //   });
    // };
    // useEffect(() => {
    //   scrollToBottom()
    // },[results])


  return (
    <ResponsiveContainer width="100%" height={350}>
        <Line data={data} options={chartOptions} />
    </ResponsiveContainer>
  )
}
