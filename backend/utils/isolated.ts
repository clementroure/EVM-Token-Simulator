/* import { Isolate } from 'isolated-vm';

export default function runHostileCode(code:string, memoryLimit: number): Promise<boolean> {
  return new Promise((resolve) => {

    const isolate = new Isolate({ memoryLimit });

    const context = isolate.createContextSync();
    const jail = context.global;

    jail.setSync('global', jail.derefInto());

    jail.setSync('log', function(...args: any[]) {
      console.log(...args);
    });

    // context.evalSync('log("hello world")');

    const hostile = isolate.compileScriptSync(code);

    hostile.run(context)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        console.error(err);
        resolve(false);
      });

  });
} */

export {}
