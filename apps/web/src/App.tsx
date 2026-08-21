import { useMutation, useQuery, useQueryClient } from "react-query";
import { config } from "./config";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/8bit/card";
import { Label } from "./components/ui/8bit/label";
import { Input } from "./components/ui/8bit/input";
import { Button } from "./components/ui/8bit/button";
import { ChatBubble } from "@pxlkit/social";
import { PxlKitIcon, AnimatedPxlKitIcon } from "@pxlkit/core";
import { Textarea } from "./components/ui/8bit/textarea";
import { CoinSpin, BouncingBall } from "@pxlkit/gamification";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/8bit/table";
import { zTaskForm, type Task, type TaskForm } from "./types/task";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
function App() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      return (
        (await axios
          .get(config.apiUrl + "api/task")
          .then((data) => data.data)) || []
      );
    },
  });

  const form = useForm({
    resolver: zodResolver(zTaskForm),
    defaultValues: {},
  });
  const { register, handleSubmit, reset } = form;
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading: isPending } = useMutation({
    mutationKey: ["tasks-post"],
    mutationFn: async (form: TaskForm) => {
      return (
        (await axios.post(config.apiUrl + "api/task", form).then((data) => {
          reset({}, { keepValues: false, keepDirty: false, keepErrors: false });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          return data.data;
        })) || undefined
      );
    },
  });
  const [randomLoadingIcon, setRandomLoadingIcon] = useState(() =>
    Math.random(),
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomLoadingIcon(Math.random());
  }, [isLoading]);

  return (
    <div className="flex items-center flex-col h-screen w-full justify-between">
      <div className="flex-1 flex items-center retro min-w-2xl w-full justify-center">
        {isLoading ? (
          <AnimatedPxlKitIcon
            size={84}
            icon={randomLoadingIcon > 0.5 ? BouncingBall : CoinSpin}
          />
        ) : tasks ? (
          <Table className="min-w-2xl w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((i) => (
                <TableRow>
                  <TableCell>{i.title}</TableCell>
                  <TableCell>{i.description}</TableCell>
                  <TableCell>{i.dateCreated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          "No data found"
        )}
      </div>
      <div className="flex-1 max-w-2xl w-full">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Tasks Form</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit((data) => mutateAsync(data))}>
            <CardContent>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  {...register("title", { disabled: isPending })}
                  placeholder="Enter a title..."
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  {...register("description", { disabled: isPending })}
                  placeholder="Enter a description..."
                />
              </div>
            </CardContent>
            <CardFooter className="mt-8">
              <Button className="ml-auto">
                <PxlKitIcon icon={ChatBubble} /> Submit Task
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default App;
