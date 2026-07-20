import express from "express";
import supabase from "../../lib/supabase.js";
import { requireAuth, getAuth } from "@clerk/express";

const router = express.Router();
const SAVED_LIST_TITLE = "Saved Cafes";

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("list")
    .select("list_id, title, notes, list_type, user_id, visit_type, cafes(*)");

  if (error) return res.status(500).json({ error: error.message });

  const boards = Object.values(
    data.reduce((acc, row) => {
      const key = `${row.user_id}-${row.title}`;
      acc[key] ??= {
        title: row.title,
        notes: row.notes,
        list_type: row.list_type,
        user_id: row.user_id,
        cafes: [],
      };
      acc[key].cafes.push({
        ...row.cafes,
        list_id: row.list_id,
        visit_type: row.visit_type,
      });
      return acc;
    }, {}),
  );

  res.json({ lists: boards });
});

router.patch("/board/privacy", async (req, res) => {
  const { user_id, title, list_type } = req.body;

  const { error } = await supabase
    .from("list")
    .update({ list_type })
    .eq("user_id", user_id)
    .eq("title", title);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ user_id, title, list_type });
});

router.get("/saved-list", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("list")
    .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
    .eq("user_id", userId)
    .eq("title", SAVED_LIST_TITLE);

  if (error) {
    console.error("Supabase get saved places error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ savedPlaces: data });
});

router.post("/saved-list", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { cafe_id } = req.body;

  if (!cafe_id) {
    return res.status(400).json({ error: "cafe_id is required" });
  }

  const { data, error } = await supabase
    .from("list")
    .insert({
      title: SAVED_LIST_TITLE,
      notes: "",
      list_type: false,
      visit_type: false,
      cafe_id: cafe_id,
      user_id: userId, // comes from the verified Clerk token, not the request body
    })
    .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.delete("/saved-list/:cafe_id", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { cafe_id } = req.params;

  const { data, error } = await supabase
    .from("list")
    .delete()
    .eq("user_id", userId)
    .eq("title", SAVED_LIST_TITLE)
    .eq("cafe_id", cafe_id)
    .select("list_id, cafe_id");

  if (error) {
    console.error("Supabase delete saved place error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Saved place not found" });
  }

  res.json({ deleted: data });
});

router.patch("/:id", async (req, res) => {
  const { visit_type } = req.body;
  const listId = Number(req.params.id);

  const { error } = await supabase
    .from("list")
    .update({ visit_type })
    .eq("list_id", listId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ list_id: listId, visit_type });
});

router.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("list")
    .delete()
    .eq("list_id", Number(req.params.id));

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
