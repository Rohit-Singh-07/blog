import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, category, content } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file to upload" });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(400).json({ message: "Failed to generate buffer" });
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const image = cloud.secure_url;
  const author = req.user?.name || "Unknown Author";

  const [blog] = await sql`
    INSERT INTO blogs (title, description, category, image, content, author)
    VALUES (${title}, ${description}, ${category}, ${image}, ${content}, ${author})
    RETURNING *;
  `;

  return res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, category, content } = req.body;
  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    return res.status(404).json({
      message: "No blog with this id",
    });
  }

  if (blog[0].author !== req.user?.name) {
    return res.status(401).json({
      message: "You are not the author",
    });
  }

  let imageUrl = blog[0].image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(400).json({ message: "Failed to generate buffer" });
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;
  }

  const [updated] = await sql`
    UPDATE blogs SET
      title = ${title || blog[0].title},
      description = ${description || blog[0].description},
      image = ${imageUrl},
      content = ${content || blog[0].content},
      category = ${category || blog[0].category}
    WHERE id = ${id}
    RETURNING *;
  `;

  return res.json({
    message: "Blog Updated",
    blog: updated,
  });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    return res.status(404).json({ message: "No blog with this id" });
  }

  const blogData = blog[0];

  if (blogData.author !== req.user?.name) {
    return res.status(401).json({ message: "You are not the author" });
  }

  // 1. Delete comments related to the blog
  await sql`DELETE FROM comments WHERE blogid = ${id}`;

  // 2. Delete savedblogs related to the blog
  await sql`DELETE FROM savedblogs WHERE blogid = ${id}`;

  // 3. Delete image from Cloudinary
  const imageUrl = blogData.image;

  // Extract public_id from URL
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
      // Not throwing here, since the blog should still be deleted
    }
  }

  // 4. Delete the blog itself
  await sql`DELETE FROM blogs WHERE id = ${id}`;

  return res.json({ message: "Blog and related data deleted successfully" });
});

// Utility function to extract public_id from Cloudinary image URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/");
    const filenameWithExtension = parts.pop()!;
    const publicId = parts.slice(parts.indexOf("upload") + 1).join("/") + "/" + filenameWithExtension.split(".")[0];
    return publicId;
  } catch {
    return null;
  }
}


