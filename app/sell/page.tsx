"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        description,
      },
    ]);

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
      return;
    }

    alert("Product added!");

    setName("");
    setPrice("");
    setDescription("");
  };

  return (
    <main>
      <h1>Sell Product</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <br />
        <br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Add Product</button>
      </form>
    </main>
  );
}