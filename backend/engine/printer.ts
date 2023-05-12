import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import { writeFile, appendFile, existsSync, mkdirSync } from 'fs';
import path from 'path';

export default class Printer{
    csvWriter: CsvWriter<ObjectMap<any>> | undefined = undefined

    constructor(values: number[]){
        this.csvWriter = createCsvWriter({
            path: 'outdir_data/data.csv',
            header: [
            {id: 'tick', title: 'tick'},
            {id: 'market', title: 'market'},
            {id: 'pool', title: 'pool'}
            ]
        });

        const filePath = path.join(__dirname, `../outdir_data`)
        if (!existsSync(filePath)) {
           mkdirSync('./outdir_data');
        } 
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

        await this.csvWriter!.writeRecords([{tick: step, market: values[0], pool: values[1]}]).catch((e) => {
            console.log(e);
        })
    }
}