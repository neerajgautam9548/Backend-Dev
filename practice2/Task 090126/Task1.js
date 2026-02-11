// Task : The "Dependency" Chain (Real-World API)
// Concept: Sequential await & Array Methods
// Scenario: You have a User ID. You need to get their "Posts," and then for the first post, you need to get the "Comments."

// The Task: Use the free API: https://jsonplaceholder.typicode.com/posts
// Step 1: Fetch all posts for userId: 1.
// Step 2: Pick the first post from that array.
// Step 3: Use that post's id to fetch all comments for that specific post (URL: /posts/POST_ID/comments).
// Step 4: Filter the comments to only show those that contain the word "et" in the body.


//Solution
async function dependencyChain() {
  try {
    const postsResponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts?userId=1"
    );

    if (!postsResponse.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await postsResponse.json();

    const firstPost = posts[0];
    console.log("First Post:");
    console.log(firstPost);

    const commentsResponse = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${firstPost.id}/comments`
    );

    if (!commentsResponse.ok) {
      throw new Error("Failed to fetch comments");
    }

    const comments = await commentsResponse.json();

    const filteredComments = comments.filter(comment =>
      comment.body.toLowerCase().includes("et")
    );

    console.log("\nFiltered Comments (containing 'et'):");
    console.log(filteredComments);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

dependencyChain();