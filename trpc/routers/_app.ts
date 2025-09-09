import {z} from 'zod';
import { inngest } from '@/inngest/client';
import prisma from '@/lib/db';
import {createTRPCRouter, baseProcedure} from '../init';
import { Input } from '@/components/ui/input';
export const appRouter = createTRPCRouter({ 
  allProjects:baseProcedure.input(z.object({userId:z.string().min(0,"invalid User ID")}))
  .query(async({input})=>{
    const projects= await prisma.project.findMany({where:{userId:input.userId}})
    if(!projects)return null
    return projects.reverse()
  }),
  msgCreate:baseProcedure.input
  (z.object({id:z.string(),content:z.string().min(1,"write a valid message")})).query(async({input})=>{
    const message=await prisma.message.create({
      data:{
        content:input.content,
        projectId:input.id,
        role:"USER",
      type:"RESULT"      }
    })
  }),
  fragment:baseProcedure.input(z.object({value:z.string()})).query(async({input})=>{
    const frag=await prisma.fragment.findFirst({where:{messageId:input.value}})
    if(!frag)return null
    return frag
  }),
  message:baseProcedure
  .input(z.object({value:z.string()}))
  .query(async({input})=>{
    const project=await prisma.project.findFirst({where:{id:input.value}})
    const messages=await prisma?.message.findMany({where:{projectId:project?.id}})
  return messages}),
  project:baseProcedure.input(z.object({userId:z.string(),projectId:z.string()}))
  .mutation(async({input})=>{
    const findProject=await prisma.project.findFirst({where:{id:input.projectId}})
    if(! findProject){
      const project=await prisma.project.create({data:{userId:input.userId,name:input.userId}});
       return project
      }
    return findProject

  }),
  invoke: baseProcedure.input(z.object({projectId:z.string(),userId:z.string(), value: z.string() })).mutation(async ({ input  }) => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        projectId:input.projectId,
        value: input.value,
        userId:input.userId,
      },
    });
    return { message: `Hello ${input.value}!` };  
  }),
  asba: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return { id: input.id, name: `yedek f zeby ${input.id}` };
    }),
});
export type AppRouter = typeof appRouter;