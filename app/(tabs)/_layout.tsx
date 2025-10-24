import { Tabs } from "expo-router";
import { ShoppingCart, BarChart3, Package, Settings } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "POS",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
