import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Input } from "./ui/input"

const FormSchema = z.object({
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
  email: z.string().email({
    message: "Email must be a valid email address.",
  }),
})

export function PasswordDialog({open, onLogin}: any) {
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
 
  function onSubmit(data: z.infer<typeof FormSchema>) {
    const realPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (data.password == realPassword) {
      onLogin(true)
      form.reset(); // clear input
    } else {
      // handle error: incorrect password
      toast({
        variant: "destructive",
        title: "Incorrect password",
        description: "Please try again.",
      })
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Token Simulator</DialogTitle>
          <DialogDescription>
            Authenticate using the credentials you received upon subscription.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 py-2">
          <FormField
              control={form.control}
              name="email"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel htmlFor="email" className="text-right">Email</FormLabel>
                  <FormControl>
                    <Input type="email" id="email" {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel htmlFor="password" className="text-right">Password</FormLabel>
                  <FormControl>
                    <Input type="password" id="password" {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
