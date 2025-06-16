import prisma from "./config/db.config.js";
import { producer, consumer } from "./config/kafka.config.js";
import redisClient from "./config/redis.js";

export const produceMessage = async (topic: string, message: any) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

export const consumeMessages = async (topic: string) => {
  await consumer.connect();
  await consumer.subscribe({ topic: topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log({
        partition,
        offset: message.offset,
        value: data,

      });
      console.log(data)
         
      const groupId= data.group_id;
      const redisKey = `group:${groupId}:chats`;


      await prisma.chats.create({
        data: data,
      });
      
      
      await  redisClient.del(redisKey);
      
      // Process the message (e.g., save to DB, trigger some action, etc.)
    },

  });
};
