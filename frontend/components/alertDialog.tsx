import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
   
  export function AlertDialogPopup({open, setOpen, onContinue ,cancelBtn, continueBtn, question, msg} : any) {

    return (
      <AlertDialog open={open}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{question}</AlertDialogTitle>
            <AlertDialogDescription>
                {msg}
            </AlertDialogDescription>
            </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>{cancelBtn}</AlertDialogCancel>
            <AlertDialogAction onClick={onContinue}>{continueBtn}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }