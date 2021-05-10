import { UpdateTodoRequest } from './../requests/UpdateTodoRequest'
import { CreateTodoRequest } from './../requests/CreateTodoRequest'
import { TodoAccess } from './../dataLayer/TodoAccess'
import { TodoItem } from './../models/TodoItem'
import { v4 as uuid } from 'uuid'
import { createLogger } from '../utils/logger'

const logger = createLogger('Todo-Logic')
const todo = new TodoAccess()

/**
 * Get all todos of specific user
 * @param userId (Owner)
 * @return All todos corresponding to a user
 */
export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todo.getAllTodos(userId)
}

/**
 * Create new todo
 * @param newTodo object from request body
 * @param userId id of todo's owner
 */
export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info(`Create new todo`)

  const newTodoItem: TodoItem = {
    userId,
    todoId: uuid(),
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo
  }

  return await todo.createTodo(newTodoItem)
}

/**
 * Update todo by id
 * @param todoId
 * @param userId Owner
 * @param updateTodo update todo object from request body
 */
export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodo: UpdateTodoRequest
) {
  return await todo.updateTodo(todoId, userId, updateTodo)
}

/**
 * Delete todo by id
 * @param todoId
 * @param userId Owner
 */
export async function deleteTodo(todoId: string, userId: string) {
  return await todo.deleteTodo(todoId, userId)
}

/**
 * @param signedUrl
 * @param todoId
 * @param userId
 */
export async function updateAttachmentUrl(
  signedUrl: string,
  todoId: string,
  userId: string
) {
  // Split url, then make use of the first part
  const attachmentUrl: string = signedUrl.split('?')[0]

  logger.info(`Signed URL ${{ attachmentUrl }}`)

  return await todo.updateAttachmentUrl(attachmentUrl, todoId, userId)
}
