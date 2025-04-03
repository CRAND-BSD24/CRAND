"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Minggu 1",
    hafalan: 2.5,
    belajar: 3.2,
  },
  {
    name: "Minggu 2",
    hafalan: 3.1,
    belajar: 3.5,
  },
  {
    name: "Minggu 3",
    hafalan: 2.8,
    belajar: 3.0,
  },
  {
    name: "Minggu 4",
    hafalan: 3.2,
    belajar: 3.8,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hafalan" name="Hafalan (halaman)" fill="#6ec1e4" />
        <Bar dataKey="belajar" name="Belajar (nilai)" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

