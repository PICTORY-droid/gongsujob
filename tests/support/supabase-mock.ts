import { vi } from "vitest";

/**
 * Supabase 쿼리 빌더 테스트 더블.
 * 체이닝 메서드(select/eq/order/...)는 자기 자신을 돌려주고, await 시 미리 정한 결과를 돌려준다.
 * 호출 기록(calls)으로 어떤 테이블에 어떤 조건을 걸었는지 검증한다.
 */
export type Call = { table: string; method: string; args: unknown[] };

export function createSupabaseMock(results: Record<string, unknown[]> = {}) {
  const calls: Call[] = [];
  const queues = new Map(Object.entries(results).map(([table, list]) => [table, [...list]]));

  const nextResult = (table: string) => {
    const queue = queues.get(table);
    return queue && queue.length > 0 ? queue.shift() : { data: null, error: null };
  };

  const from = vi.fn((table: string) => {
    const builder: Record<string, unknown> = {};
    const chain = ["select", "eq", "in", "order", "limit", "insert", "update", "upsert", "delete", "maybeSingle", "single"];
    for (const method of chain) {
      builder[method] = (...args: unknown[]) => {
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.then = (resolve: (value: unknown) => void, reject: (reason: unknown) => void) =>
      Promise.resolve(nextResult(table)).then(resolve, reject);
    return builder;
  });

  const storageBucket = {
    upload: vi.fn(async () => ({ error: null })),
    getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://storage.example/${path}` } })),
  };

  const client = {
    from,
    storage: { from: vi.fn(() => storageBucket) },
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
      signOut: vi.fn(async () => ({ error: null })),
    },
  };

  return { client, calls, storageBucket, callsFor: (table: string) => calls.filter((c) => c.table === table) };
}
