import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import { writeFile, appendFile } from 'fs';

export default class Printer{
    csvWriter: CsvWriter<ObjectMap<any>> | undefined = undefined

    constructor(values: number[]){
        this.csvWriter = createCsvWriter({
            path: 'outdir_data/data.csv',
            header: [
            {id: 'tick', title: 'tick'},
            {id: 'amountA', title: 'amountA'},
            {id: 'amountB', title: 'amountB'}
            ]
        });
    }

    initTxt(txt: string){

        writeFile('outdir_data/logs.txt', txt, (err) => {
            if (err) throw err;
        })
    }
    printTxt(txt: string){

        appendFile('outdir_data/logs.txt', txt, (err) => {
            if (err) throw err;
        })
    }

    async printCsv(step: number, values: number[]){

        await this.csvWriter!.writeRecords([{tick: step, amountA: values[0]/10**18, amountB: values[1]/10**18}]).catch((e) => {
            console.log(e);
        })
    }
}