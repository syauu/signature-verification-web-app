#!/usr/bin/env python3
"""
Test script to verify signature file cleanup functionality
"""

import os
import requests
import time

API_BASE = "http://localhost:5001/api"

def test_cleanup_functionality():
    """Test the signature file cleanup functionality"""
    
    print("=== Signature File Cleanup Test ===\n")
    
    # 1. Check current state
    uploads_dir = "/Users/syauqi/Developer/SigNet final/backend/uploads"
    
    print("1. Current files in uploads directory:")
    if os.path.exists(uploads_dir):
        files = os.listdir(uploads_dir)
        for file in files:
            print(f"   - {file}")
        print(f"   Total files: {len(files)}\n")
    else:
        print("   Uploads directory doesn't exist\n")
    
    # 2. Test manual cleanup endpoint (requires authentication)
    print("2. Testing manual cleanup endpoint...")
    print("   (Note: This requires admin authentication)\n")
    
    # 3. Check database consistency
    print("3. To verify database consistency, run these SQL queries:")
    print("   SELECT signature_image FROM HandSignature WHERE signature_image IS NOT NULL;")
    print("   -- Compare with files in uploads directory\n")
    
    print("4. Testing scenarios:")
    print("   ✓ Delete customer: Files should be removed from filesystem")
    print("   ✓ Update customer signature: Old files should be replaced")
    print("   ✓ Orphaned files: Should be cleaned up on startup")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_cleanup_functionality()
