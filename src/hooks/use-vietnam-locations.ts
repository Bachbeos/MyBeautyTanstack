import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

export interface LocationOption {
  code: number;
  name: string;
}

const api = axios.create({
  baseURL: "https://provinces.open-api.vn/api"
});

export function useVietnamLocations() {
  const [selectedProvince, setSelectedProvince] = React.useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>("");

  // Fetch Provinces
  const { data: provinces = [] } = useQuery<LocationOption[]>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const { data } = await api.get("/p/");
      return data;
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  });

  // Fetch Districts based on selected Province
  const { data: districts = [] } = useQuery<LocationOption[]>({
    queryKey: ["districts", selectedProvince],
    queryFn: async () => {
      const { data } = await api.get(`/p/${selectedProvince}?depth=2`);
      return data.districts;
    },
    enabled: !!selectedProvince
  });

  // Fetch Wards based on selected District
  const { data: wards = [] } = useQuery<LocationOption[]>({
    queryKey: ["wards", selectedDistrict],
    queryFn: async () => {
      const { data } = await api.get(`/d/${selectedDistrict}?depth=2`);
      return data.wards;
    },
    enabled: !!selectedDistrict
  });

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    handleProvinceChange: (code: string) => {
      setSelectedProvince(code);
      setSelectedDistrict("");
    },
    handleDistrictChange: (code: string) => {
      setSelectedDistrict(code);
    }
  };
}
