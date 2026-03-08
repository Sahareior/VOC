"use client"

import { useGetStatsQuery } from "../../redux/slices/apiSlice";

const Dashboard = () => {
  const {data} = useGetStatsQuery()

  console.log(data,'thdd')
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
};

export default Dashboard;