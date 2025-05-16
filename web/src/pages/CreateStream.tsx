import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { getOrganizerId, streams } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  thumbnailUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateStream() {
  const organizerId = getOrganizerId();
  const { toast } = useToast();
  const navigate = useNavigate();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
    },
  });

  const {
    data: eventsData,
    isLoading: eventsLoading,
    error
  } = useQuery({
    queryKey: ["events", organizerId],
    queryFn: () => {
      if (!organizerId) {
        throw new Error("No organizer ID found in token");
      }
      return streams.getByOrganiser(organizerId);
    },
    enabled: !!organizerId,
  });


  const { mutate: createStream, isPending } = useMutation({
    mutationFn: (values: FormValues) => streams.create(values),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Stream created successfully.",
      });
      navigate(`/stream/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating stream:", error);
      toast({
        title: "Error",
        description: "Failed to create stream. Please try again later.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    createStream(values);
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={eventsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            eventsLoading ? "Loading events..." : "Select an event"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventsData?.events?.map((event: any) => (
                          <SelectItem
                            key={event.id}
                            value={event.id}
                          >
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the event you're streaming.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="scheduleDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduleTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="et">Eastern Time (ET)</SelectItem>
                        <SelectItem value="ct">Central Time (CT)</SelectItem>
                        <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                        <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                        <SelectItem value="utc">UTC/GMT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Stream"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
