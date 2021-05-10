import { UpdateTodoRequest } from './../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import {
  DeleteItemOutput,
  DocumentClient,
  UpdateItemOutput
} from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '.././utils/logger'

const logger = createLogger('Todos-Access')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIdIndex = process.env.TODO_ID_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todoIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info(
      `Get all Todos for specific userId ${{ userId, count: result.Count }}`
    )

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(newTodo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
      .promise()

    logger.info(`Create new Todo item ${{ newTodo }}`)

    return newTodo
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updateTodo: UpdateTodoRequest
  ) {
    /**
     * You need to set variables to dynamoDB first,
     * such as, set #name, #duedate, #done
     * then assign real values from req.body (updateTodo)
     */
    const updateTodoItem: UpdateItemOutput = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
          'set #name = :name, #dueDate = :duedate, #done = :done',
        ExpressionAttributeValues: {
          ':name': updateTodo.name,
          ':duedate': updateTodo.dueDate,
          ':done': updateTodo.done
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        }
      })
      .promise()

    const updatedTodo = updateTodoItem.Attributes

    logger.info(`Updated todo ${{ updatedTodo }}`)
  }

  async deleteTodo(todoId: string, userId: string) {
    const deleteTodoItem: DeleteItemOutput = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        ReturnValues: 'ALL_OLD'
      })
      .promise()

    const deletedTodo = deleteTodoItem.Attributes

    logger.info(`Deleted Todo ${{ deletedTodo }}`)
  }
}
