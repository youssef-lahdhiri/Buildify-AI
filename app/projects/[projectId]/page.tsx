"use client";
import { ArrowDown } from "lucide-react";
import { Code2 } from "lucide-react";
import { Monitor } from "lucide-react";
import MessageInput from "./message-input";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "@/components/ui/code-view/code-theme.css";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import If from "../../ifram";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import getUser from './getUser';
import { UserButton, useUser } from "@clerk/nextjs";
import { createTRPCProxyClient } from "@trpc/client";
export default function ClientGreeting({ params }: any) {
  // const aa= await params.projectId
  // console.log(aa)
  const [userId, setUserId] = useState("");
  const { user, isSignedIn, isLoaded } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (!user && isLoaded) router.push("/");
    if (user) setUserId(user.id);
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
    console.log("user is ", user);
  }, [user, isLoaded, isSignedIn]);

  //loading message init
  const [index, setIndex] = useState(0);
  const waitingMessages = [
    "Analyzing your ideas…",
    "Summoning pixels and code…",
    "Turning your vision into reality…",
    "Almost there… your website is waking up!",
    "Mixing creativity with AI magic…",
  ];
  const trpc = useTRPC();
  //fetching all projects
  const { data: projects } = useSuspenseQuery(
    trpc.allProjects.queryOptions({ userId: userId }, { refetchInterval: 3000 })
  );
  //adding msg to db
  //    const aaa=await useSuspenseQuery(trpc.project.queryOptions({projectId:aa,userId:userId}))
  //   useEffect(()=>{
  //     console.log("new id is :",aaa.data.id)
  //     // router.push(`/projects/${aaa.data?.id}`)
  // },[])
  //getting project Id
  const [projectId, setProjectId] = useState("");
  const path = usePathname();
  // const project=trpc.project.mutationOptions({})
  //fetching messages
  const { data: messages, isLoading: load } = useSuspenseQuery(
    trpc.message.queryOptions(
      { value: projectId },
      {
        enabled: !!projectId,
        refetchInterval: 3000,
      }
    )
  );
  //looping waiting message index
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % waitingMessages.length);
    }, 3000);
    return () => clearInterval(id);
  }, [load]);
  //fetching sandboxUrl
  const [id, setId] = useState("");
  const [value, setValue] = useState("");
  const { data: fragg, isLoading } = useSuspenseQuery(
    trpc.fragment.queryOptions({ value: id })
  );
  const [frag, setFrag] = useState<typeof fragg>(null);
  useEffect(() => {
    setFrag(fragg);
  }, [fragg]);
  useEffect(() => {
    // setId("")
    // setFrag(null)
    //
    createProject.mutate({
      userId: userId,
      projectId: path.substring(
        path.indexOf("/projects/") + "/projects/".length
      ),
    });
    // console.log("projectId from use effec/t ",projectId)
    setProjectId(
      path.substring(path.indexOf("/projects/") + "/projects/".length)
    );
    console.log("projectId from use effect ", projectId);
    // return()=>clearInterval(id)
  }, [userId, path]);
  useEffect(() => {
    if (messages && messages.length > 0) {
      if (messages[messages.length - 1].role == "ASSISTANT") {
        setId(messages[messages.length - 1].id);
      }
    }
  }, [messages]);
  const [url, setUrl] = useState("");
  const [dataa, setData] = useState<typeof messages | null>(null);
  const invoke = useMutation(trpc.invoke.mutationOptions({}));
  const [sc, setSc] = useState<HTMLElement | null>();
  //scroll to last message on new message load
  useEffect(() => {
    var sc = document.getElementById("msg");
    setSc(sc);
    if (sc) {
      sc.scrollTop = sc.scrollHeight;
    }
  }, [sc?.scrollHeight]);
  // setting messages
  useEffect(() => {
    if (messages) setData(messages);
  }, [messages]);
  const handelClick = async (value: string) => {
    setId(value);
    if (frag) {
      setUrl(frag.sandboxUrl);
    }
  };
  // useEffect(()=>{
  //   if(projects){
  //     router.push(`/projects/${projects[projects.length-1].id}`)
  //   }
  // },[])
  useEffect(() => {
    const prompt = localStorage.getItem("temporary-prompt");
    if (prompt && isLoaded && isSignedIn&&projectId!="1"&&projectId!="") {
      invoke.mutate({ value: prompt, userId: user?.id, projectId: projectId });
      console.log("projectId for prompt  :",projectId)
      // router.push(`/projects/${projectId}`)
      localStorage.removeItem("temporary-prompt");
    }
  }, [user,projectId]);
  // useEffect(() => {
  //   // if(messages)setData(messages)
  //   // if(fragg!=null)setFrag(fragg)
  // }, []);
  const createProject = useMutation(
    trpc.project.mutationOptions({
      onSuccess: (newProject) => {
        if (newProject) {
          setProjectId(newProject.id);
          router.push(`/projects/${newProject.id}`);
        }
      },
    })
  );
  //  console.log( createProject)
  return (
    <div className="bg-[#0F0F1A] h-[100vh] ">
      <div className="border-b-[rgba(255,255,255,0.09)] h-[10vh] w-full border-1 border-transparent flex  items-center">
        <div className="text-3xl font-bold w-fit ml-3 ">
          {" "}
          <span>
            Buildify<span className="text-indigo-400">AI</span>
          </span>
        </div>
        <div className="ml-auto mr-3 size-10">
          {" "}
          <UserButton />{" "}
        </div>
      </div>
      <div className="flex my-4  w-full justify-around gap-5 bg-[#0F0F1A]">
        <div className="!w-[29vw] ml-2 bg-[#1A1A28] scroll-y overflow-y-auto  border-[rgba(255,255,255,0.09)] border-1 flex h-[85vh] rounded-md">
          <div
            id="msg"
            className="scroll-smooth t flex flex-col h-[70vh] overflow-y-auto gap-2   w-full"
          >
            <div className="sticky top-0 z-10 bg-black/70 ">
              <DropdownMenu>
                <DropdownMenuTrigger className=" text-center  ml-5 p-2 flex items-center justify-center ">
                  Projects <ArrowDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/70 text-white h-[40vh]">
                  {projects?.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={(e) => {
                        router.push(`/projects/${p.id}`);
                      }}
                    >
                      {" "}
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={async () =>
                      await createProject.mutate({ userId, projectId: "" })
                    }
                  >
                    New project{" "}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {dataa?.map((i) => (
              <div
                key={i.id}
                className={`flex rounded-md text-wrap w-4/5 p-2  mx-3   ${
                  i.role !== "ASSISTANT"
                    ? "bg-blue-600  self-end"
                    : " text-[#E0E0E0] bg-gray-800 text-gray-100 self-start"
                }`}
              >
                {i.content}
                {i.role === "ASSISTANT" && (
                  <Button
                    className="ml-2 cursor-pointer"
                    onClick={() => handelClick(i.id)}
                  >
                    preview
                  </Button>
                )}
              </div>
            ))}
            <div>
              {dataa &&
                dataa.length > 0 &&
                dataa[dataa.length - 1].role == "USER" && (
                  <div className="animate-[fade_3s_ease-in-out_infinite] opacity-10">
                    {waitingMessages[index]}
                  </div>
                )}
            </div>
          </div>
          <div className="absolute flex bottom-[10vh] w-[30vw]">
            <MessageInput userId={userId} projectId={projectId} />
          </div>
        </div>
        <div className=" w-[69vw] mr-2 border-[rgba(255,255,255,0.09)] border-1 bg-[#1A1A28] h-[85vh] rounded-md  overflow-hidden ">
          {messages.length>1?id != "" && frag != null && (
            // <div className=' w-[69vw] mr-2 border-[rgba(255,255,255,0.09)] border-1 bg-[#1A1A28] h-[85vh] rounded-md  overflow-hidden '>
            <Tabs defaultValue="preview" className="  ">
              <TabsList className="bg-black text-center">
                <TabsTrigger className="" value="code">
                  <Code2 /> Code
                </TabsTrigger>
                <TabsTrigger value="preview">
                  {" "}
                  <Monitor /> Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent className="  " value="code">
                <Tabs defaultValue="app/page.tsx" className="flex flex-row  ">
                  <TabsList className="flex bg-black  text-white  flex-col h-full">
                    {Object.entries(frag.files).map(([filename, code]) => (
                      <TabsTrigger key={filename} value={filename}>
                        {filename}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(frag.files).map(([filename, code]) => (
                    <TabsContent
                      className=" h-[85vh] overflow-scroll overflow-x-hidden"
                      key={filename}
                      value={filename}
                    >
                      <SyntaxHighlighter
                        language="tsx"
                        style={tomorrow}
                        showLineNumbers={true}
                        wrapLines={true}
                      >
                        {String(code)}
                      </SyntaxHighlighter>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              <TabsContent className="w-[70vw] h-[95vh] " value="preview">
                {!isLoading && <If url={frag.sandboxUrl} />}
              </TabsContent>
            </Tabs>
          ):messages.length==0?null:<p className="  ease-linear  h-full w-full items-center justify-center  flex ">
<p className="  bg-[#c7c7d6] rounded-full size-6 animate-bounce delay-200"></p>
<p className="  bg-[#c7c7d6] rounded-full size-6 animate-bounce delay-100"></p>
<p className=" bg-[#c7c7d6] rounded-full size-6 animate-bounce"></p>

          </p> }
        </div>
      </div>
    </div>
  );
}
