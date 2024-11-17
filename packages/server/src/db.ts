 // Import Azure Cosmos SDK and task model
  import { CosmosClient } from '@azure/cosmos';
  import { Task } from './models/task';

/**
 * This class is responsible for handling all the database operations
 * for the tasks.
 * It uses the Azure Cosmos DB SDK to interact with the database.
 * The class is initialized with the connection details for the Azure Cosmos DB.
 * It provides methods to get all tasks, get a single task, create a task,
 * update a task, and delete a task.
 * The methods are asynchronous and return promises that resolve to the
 * requested data.
 * The class is used by the task service to interact with the database.
 * @class
 * @public
 * @constructor
 * @method getTasks - Get all tasks for a user based on userId
 * @method getTask - Get a single task based on the task id
 * @method createTask - Create a new task
 * @method updateTask - Update an existing task
 * @method deleteTask - Delete a tasks
 */
// Create a singleton instance of DbService and get that instance
// when the module is imported

export class DbService {
  private static instance: DbService;
  private client: CosmosClient;
  private database: string;
  private container: string;

  constructor() {
    // Check that the environment variables are set
    if (!process.env.COSMOSDB_URI) {
      throw new Error('Please define the COSMOSDB_URI environment variable');
    }
    if (!process.env.COSMOSDB_KEY) {
      throw new Error('Please define the COSMOSDB_KEY environment variable');
    }
    this.client = new CosmosClient({
      endpoint: process.env.COSMOSDB_URI,
      key: process.env.COSMOSDB_KEY
    });
    this.database = 'todos';
    this.container = 'tasks';
  }

  static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

// Get all tasks for a user based on userId
  async getTasks(userId: string): Promise<Task[]> {
    const { resources } = await this.client
      .database(this.database)
      .container(this.container)
      .items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();
    return resources;
  }

  async getTask(id: string): Promise<Task> {
    const { resource } = await this.client
      .database(this.database)
      .container(this.container)
      .item(id)
      .read();
    return resource;
  }

  async createTask(task: Task): Promise<Task> {
    const { resource } = await this.client
      .database(this.database)
      .container(this.container)
      .items.create(task);

    return resource as Task;
  }

  async updateTask(id: string, task: Task): Promise<Task> {
    const { resource } = await this.client
      .database(this.database)
      .container(this.container)
      .item(id)
      .replace(task);
    return resource as Task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client
      .database(this.database)
      .container(this.container)
      .item(id)
      .delete();
  }
}
