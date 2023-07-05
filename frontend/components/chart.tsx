import { ResponsiveContainer } from "recharts"
import { useEffect } from 'react';
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

    const { theme, setTheme } = useTheme();
  
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
          display: false
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

  return (
    <ResponsiveContainer width="100%" height={350}>
        <Line data={data} options={chartOptions} />
    </ResponsiveContainer>
  )
}
