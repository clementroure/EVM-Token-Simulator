import Page from '@/components/page'
import Section from '@/components/section'
import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);
  
export const options = {
	responsive: true,
	interaction: {
	  mode: 'index' as const,
	  intersect: false,
	},
	stacked: false,
	plugins: {
	  title: {
		display: true,
		text: 'Liquidity Pool',
	  },
	  tooltip: {
        callbacks: {
          label: function(context:any) {
			console.log(context)
			const i = Math.round(context.raw[0])

            return context.dataset.data[i][1]
          }
        } 
      }
	},
	scales: {
	  y: {
		type: 'linear' as const,
		display: true,
		position: 'left' as const,
		grid: {
			display: false,
		},
	  },
	  y1: {
		type: 'linear' as const,
		display: true,
		position: 'right' as const,
		grid: {
		  drawOnChartArea: true,
		  display: true,
		},
	  },
	},
  };  

export default function Index () {

	const inputCsvSelection = useRef<HTMLInputElement>(null);

	const [csvFile, setCsvFile] = useState()

	const [data, setData] = useState<{ labels: string[]; datasets: { label: string; data: any[]; borderColor: string; backgroundColor: string; }[];}>()

	const [labels, setLabels] = useState([])

	useEffect(() => {
		if(csvFile != undefined)
       	Papa.parse(csvFile, {
			header: true,
			skipEmptyLines: true,
			complete: function (results: any) {
				// @ts-ignore
				const rowsArray = [];
				// @ts-ignore
				const valuesArray: unknown[][] = [];

				// Iterating data to get column name and their values
				results.data.map((d: any) => {
					// if(d.Tick != 0){ // 1st row is equals to 0
						rowsArray.push(Object.keys(d));
						valuesArray.push(Object.values(d));
					// }
				});

				// counter en fonction de day 
				const reducedMatrix = valuesArray.map(row => [row[0], row[valuesArray[0].length-2]]);
				console.log(reducedMatrix)

				// counter en fonction de day 
				const reducedMatrix2 = valuesArray.map(row => [row[0], row[valuesArray[0].length-1]]);

				setData(
					{
						labels,
						datasets: [
							{
							label: 'Amount A',
							data: reducedMatrix,
							borderColor: 'rgb(255, 99, 132)',
							backgroundColor: 'rgba(255, 99, 132, 0.5)',
							// @ts-ignore
							yAxisID: 'y',
							},
							{
							label: 'Amount B',
							data: reducedMatrix2,
							borderColor: 'rgb(0, 0, 255)',
							backgroundColor: 'rgba(0, 0, 255, 0.5)',
							// @ts-ignore
							yAxisID: 'y1',
							},
						],
					}
				)
			},
		});
	},[csvFile]);

	const csvSelection = async (e:any) => {

		if (e.target.files[0] > 10e6) {
		  window.alert("ERROR: Upload a file smaller than 10 Mb.");
		  return;
		}
	
		if (e.target.files && e.target.files[0]) {
	
		   setCsvFile(e.target.files[0]);
		}
	}

	// call python backend
	const simulate = async (route: string) => {

		fetch(`http://127.0.0.1:5000/${route}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				test: 'test'
			}), 
		})
		.then(response => response.json())
        .catch(error => console.log(error))
	}
	useEffect(() => {
    //    simulate('uniswapv2')
	},[])

    return(
	<Page>
		<Section>
			<div className=''>
				<div className='m-16 w-full sm:w-11/12 mx-auto justify-center items-center text-center'>
					{/* <h2 className='text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4'>
						Chart
					</h2> */}

					<form className="mt-8 space-y-3 mb-10 max-w-xl mx-auto">

						<div className="grid grid-cols-1 space-y-2">
							{/* <label className="text-sm font-bold text-gray-800 dark:text-gray-300 tracking-wide">Csv file</label> */}
							<div className="flex items-center justify-center w-full">
								<label className="flex flex-col rounded-lg border-4 border-dashed border-gray-500 dark:border-gray-400 w-full h-32 p-10 group text-center">
									<div className="h-full w-full text-center flex flex-col items-center justify-center">
										<label onClick={() => inputCsvSelection.current?.click()} className="pointer-none text-gray-600 dark:text-gray-500 text-sm"><span className=""> </span><p className="text-blue-600 hover:underline cursor-pointer text-base">select a .csv file</p>from your device</label>
									</div>
									<input ref={inputCsvSelection} onChange={(e) => { if((e.target.files && e.target.files[0]) && (!e.target.files[0].type.startsWith("file"))) { csvSelection(e); } else{ alert("ERROR: File selected is not a .csv file") } (e.target as HTMLInputElement).value = "";}} accept="csv" type="file" className="hidden"/>
								</label>
							</div>
						</div>
					</form>

					{data != undefined &&
				      <Line height={80} options={options} data={data} />
					}
				</div>
			</div>
		</Section>
	</Page>
	)
}
