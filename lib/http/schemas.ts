import { z } from "zod";

/** API 입력 스키마. 응답 문구(no address, no coords)는 기존 클라이언트 호환을 위해 유지한다. */

const MAX_ADDRESS_LENGTH = 200;

export const geocodeQuerySchema = z.object({
  address: z
    .string({ error: "no address" })
    .trim()
    .min(1, "no address")
    .max(MAX_ADDRESS_LENGTH, "address too long"),
});

export const weatherQuerySchema = z
  .object({
    address: z.string().trim().max(MAX_ADDRESS_LENGTH).optional(),
    region: z.string().trim().max(MAX_ADDRESS_LENGTH).optional(),
  })
  .transform((q) => ({ location: q.address || q.region || "서울" }));

const coordinate = (min: number, max: number) =>
  z
    .string({ error: "no coords" })
    .transform((value) => parseFloat(value))
    .refine((value) => Number.isFinite(value) && value >= min && value <= max, "no coords");

export const staticMapQuerySchema = z.object({
  lat: coordinate(-85, 85),
  lng: coordinate(-180, 180),
});
