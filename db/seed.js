const {
  addTagsToPost,
  client,
  createPost,
  createPostTag,
  createTags,
  createUser,
  getAllPosts,
  getAllUsers,
  getPostById,
  getPostsByTagName,
  getPostsByUser,
  getUserById,
  updatePost,
  updateUser,
} = require("./index");

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({
      username: "albert",
      password: "bertie99",
      name: "Albert Palbert",
      location: "San Francisco",
    });
    await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Sandra Shells",
      location: "Atlantic City",
    });
    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Paris Hilton",
      location: "Beverly Hills",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love reading them.",
      tags: ["#happy", "#youcandoanything"],
    });
    await createPost({
      authorId: sandra.id,
      title: "Amazing recipe for chocolate milk",
      content: "First ingredient is chocolate, second ingredient is milk.",
      tags: ["#happy", "#circuit-sircat"],
    });
    await createPost({
      authorId: glamgal.id,
      title: "How To Blah BLah BLAH",
      content: "BLAH blah blah blah BLAH Blah blAH blah ablahahhh",
      tags: ["#worst-day-ever", "#circuit-sircat", "#youcandoanything"],
    });
  } catch (error) {
    throw error;
  }
}

async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
      `);
    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");
    await client.query(`
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    CREATE TABLE posts(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    CREATE TABLE tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    );
    CREATE TABLE post_tags (
     "postId" INTEGER REFERENCES posts(id),
     "tagId" INTEGER REFERENCES tags(id),
     CONSTRAINT post_tags_unique UNIQUE ("postId", "tagId")
    );
      `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");

    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    console.log("Error during rebuildDB...");
    throw error;
  }
}
async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result: ", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "John Doe",
      location: "Boston",
    });
    console.log("Result: ", updateUserResult);

    console.log("Calling getAllPosts!");
    const posts = await getAllPosts();
    console.log("Drumroll please... :", posts);

    console.log("Calling getPostById!");
    const post = await getPostById(1);
    console.log("Please have tags:", post);

    console.log("Calling getPostsByTagName with #happy");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("Result:", postsWithHappy);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"],
    });
    console.log("Result:", updatePostTagsResult);

    console.log("RESULT: ", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
