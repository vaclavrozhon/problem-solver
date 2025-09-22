#!/usr/bin/env python3
"""
Minimal reproducer for RLS issue (Step 7 from debugging guide).

Usage:
    export TEST_ACCESS_TOKEN="eyJhbGci..."  # Paste real end-user token from frontend
    python test_rls_minimal.py
"""

from supabase import create_client
import jwt, time, os

def main():
    # Get environment variables
    URL = os.environ.get("SUPABASE_URL")
    ANON = os.environ.get("SUPABASE_ANON_KEY")
    TOKEN = os.environ.get("TEST_ACCESS_TOKEN")

    if not all([URL, ANON, TOKEN]):
        print("❌ Missing environment variables:")
        print(f"   SUPABASE_URL: {'✓' if URL else '❌'}")
        print(f"   SUPABASE_ANON_KEY: {'✓' if ANON else '❌'}")
        print(f"   TEST_ACCESS_TOKEN: {'✓' if TOKEN else '❌'}")
        print("\nSet TEST_ACCESS_TOKEN to a real JWT from frontend session")
        return

    print(f"🔍 Testing with URL: {URL}")
    print(f"🔍 Token (first 27): {TOKEN[:27]}")

    # Decode JWT to get sub
    try:
        claims = jwt.decode(TOKEN, options={"verify_signature": False})
        sub = claims["sub"]
        exp = claims.get("exp", 0)
        exp_delta = int(exp - time.time()) if exp else None

        print(f"🔍 JWT sub: {sub}")
        print(f"🔍 JWT exp_delta: {exp_delta} ({'EXPIRED' if exp_delta and exp_delta < 0 else 'valid'})")

        if exp_delta and exp_delta < 0:
            print("❌ Token is EXPIRED - get a fresh one from frontend")
            return

    except Exception as e:
        print(f"❌ Failed to decode JWT: {e}")
        return

    # Create authenticated client
    try:
        db = create_client(URL, ANON)
        db.postgrest.auth(TOKEN)
        print("✓ Created authenticated client")
    except Exception as e:
        print(f"❌ Failed to create client: {e}")
        return

    # Test insert
    payload = {
        "owner_id": sub,
        "name": f"test-{int(time.time())}",
        "status": "idle",
        "current_round": 0,
        "config": {}
    }

    print(f"🔍 Attempting insert with payload: {payload}")

    try:
        result = db.table("problems").insert(payload).execute()
        print(f"✅ SUCCESS! Inserted problem: {result.data}")

        # Clean up - delete the test problem
        if result.data:
            problem_id = result.data[0]["id"]
            db.table("problems").delete().eq("id", problem_id).execute()
            print(f"✓ Cleaned up test problem {problem_id}")

    except Exception as e:
        print(f"❌ INSERT FAILED: {e}")
        print(f"🔍 Error type: {type(e).__name__}")

        # Try to parse error details
        try:
            if hasattr(e, 'args') and e.args:
                error_data = e.args[0]
                if isinstance(error_data, dict):
                    print(f"🔍 Error code: {error_data.get('code')}")
                    print(f"🔍 Error message: {error_data.get('message')}")
                    print(f"🔍 Error details: {error_data.get('details')}")
        except:
            pass

if __name__ == "__main__":
    main()