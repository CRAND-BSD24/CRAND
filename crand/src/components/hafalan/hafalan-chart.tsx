"use client"

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Minggu 1",
    "Kelas 10": 2.1,
    "Kelas 11": 2.5,
    "Kelas 12": 3.2,
  },
  {
    name: "Minggu 2",
    "Kelas 10": 2.3,
    "Kelas 11": 2.8,
    "Kelas 12": 3.5,
  },
  {
    name: "Minggu 3",
    "Kelas 10": 2.5,
    "Kelas 11": 3.0,
    "Kelas 12": 3.3,
  },
  {
    name: "Minggu 4",
    "Kelas 10": 2.8,
    "Kelas 11": 3.2,
    "Kelas 12": 3.8,
  },
]

export function HafalanChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Kelas 10" stroke="#6ec1e4" />
        <Line type="monotone" dataKey="Kelas 11" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Kelas 12" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  )
}

