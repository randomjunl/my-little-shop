"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    name: z.string().min(1, "Store name is required"),
    description: z.string().optional(),
});


export const StoreModal = () => {
    const storeModal = useStoreModal();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Handle form submission logic here
        console.log("Form submitted:", data);
    }

    return (
        <Modal
            title="Create Store"
            description="Manage your store settings"
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="My Little Shop" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your store name. It will be displayed publicly.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="pt-6 space-x-2 flex items-center justify-end">
                        <Button variant="outline" onClick={storeModal.onClose}>Cancel</Button>
                        <Button type="submit">Continue</Button>
                    </div>

                </form>
            </Form>

        </Modal>
    );

};
