import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ 
  groupId: "chats" ,
  heartbeatInterval: 30000 , // send heartbeats every 3 seconds
  sessionTimeout: 300000 ,   // if no heartbeat in 30s, assume dead
  rebalanceTimeout: 60000    // rebalance must complete in 60s

});

export const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Kafka Producer connected...");
};
