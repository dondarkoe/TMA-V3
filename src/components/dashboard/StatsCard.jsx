
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, gradient, change }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="backdrop-blur-xl bg-black/50 border border-amber-500/20 shadow-2xl hover:shadow-3xl hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-20 backdrop-blur-xl`}>
            <Icon className="h-4 w-4 text-amber-300" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          {change && (
            <p className="text-xs text-amber-400 font-medium">
              {change} from last month
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
