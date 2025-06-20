import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import redisClient from "../config/redis.js";

class ChatsController {
  static async index(req: Request, res: Response) {
    const { groupId } = req.params;
    const redisKey = `group:${groupId}:chats`;

   try {
//       // Try fetching recent chats from Redis
      const cachedChats = await redisClient.lrange(redisKey, 0, 9); // Get latest 10
      if (cachedChats && cachedChats.length > 0) {
    const parsedChats = cachedChats.map((chat, idx) => {
  try {
    return JSON.parse(JSON.stringify(chat));
  } catch (err) {
    console.warn(`Invalid JSON at index ${idx}:`, chat);
    return null;
  }
}).filter(Boolean);
        return res.json({ data: parsedChats.reverse()})
      }

      // If Redis is empty, fetch from DB
      const chats = await prisma.chats.findMany({
        where: {
          group_id: groupId,
        },
        orderBy: {
          created_at:"desc"//g your table has created_at timestamp
        },
        
      });

      // Store in Redis
      if (chats.length > 0) {
        const pipeline = redisClient.pipeline();
        chats.forEach((chat) => {
          pipeline.lpush(redisKey, JSON.stringify(chat));
        });
      //  pipeline.ltrim(redisKey, 0, 9); // Keep only latest 10
        pipeline.expire(redisKey, 60 * 5); // Optional: auto-expire in 5 mins
        await pipeline.exec();
      }

      return res.json({ data: chats, source: "db" });

    } catch (err) {
      console.error("Chat Fetch Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default ChatsController;
