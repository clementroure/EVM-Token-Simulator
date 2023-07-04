"use client"

import React, { useEffect, useRef, useState } from 'react';
import Editor, { DiffEditor, useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { defaultCode } from './defaultCode'
import { toast } from '@/components/ui/use-toast';

function CodeEditor(props: any) {
  const editorRef = useRef<any | null>(null);
  const [editorValue, setEditorValue] = useState(defaultCode);
  const [consoleOutput, setConsoleOutput] = useState('');
  const { theme, setTheme } = useTheme();

  // monaco diff editor
  const [originalCode, setOriginalCode] = useState(defaultCode);
  const [modifiedCode, setModifiedCode] = useState(defaultCode);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    const code = editorRef.current?.getValue();

    try {
      // Overwrite console.log for our "console" component
      const consoleLog = console.log;
      // console.log = (...args) => setConsoleOutput((output) => output + '\n' + args.join(' '));
      console.log = (...args) => {
        const message = args.join(' ');
        consoleLog(message);
      };
      
      // Run the code
      // eslint-disable-next-line no-eval
      // eval(code);

      // call backend to isolate code
      props.isolate(code)

      // Restore original console.log
      console.log = consoleLog;
    } catch (err) {
      setConsoleOutput(err!.toString());
    }
  };

  const fakeRunCode = () => {
    const data = {
      name: 'clement',
      date: '2000'
    }
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 shadow-xl">
      {!props.diff ?
        <Editor
          theme={theme == 'light' ? 'vs-light' : 'vs-dark'}
          height="50vh"
          defaultLanguage="typescript"
          defaultValue={defaultCode}
          onMount={handleEditorDidMount}
          onChange={(value:any)=> setEditorValue(value)}
        />
        :
        <DiffEditor
          height="50vh"
          theme={theme == 'light' ? 'vs-light' : 'vs-dark'}
          original={originalCode}
          modified={modifiedCode}
          language="javascript"
        /> 
      }

{/*       <Button className="px-4 py-2 mt-4" onClick={runCode}>
        Run Code
      </Button> */}
      {/* <pre className="p-4 mt-4 bg-white rounded shadow">{consoleOutput}</pre> */}
    </div>
  );
}

export default CodeEditor;