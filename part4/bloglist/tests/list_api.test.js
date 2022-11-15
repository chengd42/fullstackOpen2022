const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const { initalBlogs, blogsInDb } = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = initalBlogs.map((note) => new Blog(note))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

test('all blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const blogs = await blogsInDb()
  expect(blogs).toHaveLength(initalBlogs.length)
})

test('the unique identifier property is named id', async () => {
  const blogs = await blogsInDb()
  blogs.forEach((blog) => expect(blog.id).toBeDefined())
})

test('a blog can be added', async () => {
  const newBlog = {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await blogsInDb()
  const titles = blogsAtEnd.map((n) => n.title)

  expect(blogsAtEnd).toHaveLength(initalBlogs.length + 1)
  expect(titles).toContain(
    'Go To Statement Considered Harmful',
  )
})

afterAll(() => {
  mongoose.connection.close()
})