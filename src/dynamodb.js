import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Connect to DynamoDB Mumbai
const client = new DynamoDBClient({ region: "ap-south-1" });
const db = DynamoDBDocumentClient.from(client);

// Save a chat message
export async function saveChatMessage(userId, message, aiResponse) {
  await db.send(new PutCommand({
    TableName: "ChatHistory",
    Item: {
      userId: userId,
      timestamp: Date.now(),
      message: message,
      aiResponse: aiResponse
    }
  }));
}

// Get all chats for a user
export async function getUserChats(userId) {
  const result = await db.send(new QueryCommand({
    TableName: "ChatHistory",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId }
  }));
  return result.Items;
}

// Save user info
export async function saveUser(userId, email, name) {
  await db.send(new PutCommand({
    TableName: "Users",
    Item: {
      userId: userId,
      email: email,
      name: name,
      createdAt: Date.now()
    }
  }));
}

// Save course progress
export async function saveProgress(userId, courseId, score) {
  await db.send(new PutCommand({
    TableName: "UserProgress",
    Item: {
      userId: userId,
      courseId: courseId,
      score: score,
      updatedAt: Date.now()
    }
  }));
}