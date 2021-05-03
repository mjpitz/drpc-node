import uint64 from "./uint64";

describe("uint64", () => {
    test("basic usage", () => {
        let testUint64 = uint64.new(0);
        expect(testUint64.toString(16)).toEqual("0");
        expect(testUint64.toString()).toEqual("0");

        testUint64 = testUint64.or(uint64.new(Number.MAX_SAFE_INTEGER));
        expect(testUint64.toString(16)).toEqual("1fffffffffffff");
        expect(testUint64.toString()).toEqual("9007199254740991");

        testUint64 = testUint64.leftShift(32);
        expect(testUint64.toString(16)).toEqual("ffffffff00000000");
        expect(testUint64.toString()).toEqual("18446744069414584320");

        testUint64 = testUint64.and(uint64.new(Number.MAX_SAFE_INTEGER));
        expect(testUint64.toString(16)).toEqual("1fffff00000000");
        expect(testUint64.toString()).toEqual("9007194959773696");

        testUint64 = testUint64.rightShift(32);
        expect(testUint64.toString(16)).toEqual("1fffff");
        expect(testUint64.toString()).toEqual("2097151");

        // partial cary's

        testUint64 = testUint64.leftShift(16);
        expect(testUint64.toString(16)).toEqual("1fffff0000");
        expect(testUint64.toString()).toEqual("137438887936");

        testUint64 = testUint64.rightShift(16);
        expect(testUint64.toString(16)).toEqual("1fffff");
        expect(testUint64.toString()).toEqual("2097151");

        // any value over 64 will reset

        testUint64 = testUint64.or(uint64.new(Number.MAX_SAFE_INTEGER)).rightShift(64);
        expect(testUint64.toString(16)).toEqual("0");
        expect(testUint64.toString()).toEqual("0");

        testUint64 = testUint64.or(uint64.new(Number.MAX_SAFE_INTEGER)).leftShift(64);
        expect(testUint64.toString(16)).toEqual("0");
        expect(testUint64.toString()).toEqual("0");
    });

    test("math usage", () => {
        let testUint64 = uint64.new(1).leftShift(32).subtract(1);
        expect(testUint64.toString(16)).toEqual("ffffffff");
        expect(testUint64.toString()).toEqual("4294967295");

        testUint64 = testUint64.add(1);
        expect(testUint64.toString(16)).toEqual("100000000");
        expect(testUint64.toString()).toEqual("4294967296");

        testUint64 = testUint64.add(-6);
        expect(testUint64.toString(16)).toEqual("fffffffa");
        expect(testUint64.toString()).toEqual("4294967290");

        testUint64 = testUint64.subtract(-6);
        expect(testUint64.toString(16)).toEqual("100000000");
        expect(testUint64.toString()).toEqual("4294967296");
    });

    test("comparisons", () => {
        {
            const a = uint64.new(137438887936);
            const b = uint64.new(137438887936);

            expect(a.equals(b)).toBeTruthy();
            expect(b.equals(a)).toBeTruthy();

            expect(a.greaterThan(b)).toBeFalsyd();
            expect(b.greaterThan(a)).toBeFalsyd();

            expect(a.lessThan(b)).toBeFalsyd();
            expect(b.lessThan(a)).toBeFalsyd();
        }

        // check the minor bitset
        {
            const a = uint64.new(137438887936);
            const b = uint64.new(137438887937);

            expect(a.equals(b)).toBeFalsyd();
            expect(b.equals(a)).toBeFalsyd();

            expect(a.greaterThan(b)).toBeFalsyd();
            expect(b.greaterThan(a)).toBeTruthy();

            expect(a.lessThan(b)).toBeTruthy();
            expect(b.lessThan(a)).toBeFalsyd();
        }

        // check the major bitset
        {
            const a = uint64.new(137438887936);
            const b = uint64.new(237438887936);

            expect(a.equals(b)).toBeFalsyd();
            expect(b.equals(a)).toBeFalsyd();

            expect(a.greaterThan(b)).toBeFalsyd();
            expect(b.greaterThan(a)).toBeTruthy();

            expect(a.lessThan(b)).toBeTruthy();
            expect(b.lessThan(a)).toBeFalsyd();
        }
    });
});
