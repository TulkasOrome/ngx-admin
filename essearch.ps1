# test-identity-search-fixed.ps1
# Test identity searches based on actual field mappings

$testCases = @(
    @{
        Name = "Australia - Daniel Friedman"
        Port = 9201
        Country = "AU"
        Index = "identity_australia_prod"
        Data = @{
            firstName = "Daniel"
            lastName = "Friedman"
            dateOfBirth = "1957-06-23"
            email = "dan.windward@gmail.com"
            mobile = "0448917243"
        }
    },
    @{
        Name = "Indonesia - Liem Hong"
        Port = 9202
        Country = "ID"
        Index = "identity_indo_prod"
        Data = @{
            firstName = "Liem"
            lastName = "Hong"
            dateOfBirth = "1941-05-13"
            email = "erlinaprayogo@yahoo.com"
            mobile = "895333668255"
        }
    },
    @{
        Name = "Malaysia - Goh Soon"
        Port = 9204
        Country = "MY"
        Index = "identity_malay_prod"
        Data = @{
            firstName = "Goh"
            lastName = "Soon"
            dateOfBirth = "1963-10-30"
            nationalId = "631030015045"
            mobile = "0138453837"
        }
    },
    @{
        Name = "Japan - Masako Furuno"
        Port = 9203
        Country = "JP"
        Index = "identity_japan_prod"
        Data = @{
            firstName = "Masako"
            lastName = "Furuno"
            dateOfBirth = "1982-08-27"
            mobile = "819067715237"
        }
    }
)

Write-Host "Testing Identity Searches with Actual Field Mappings..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

foreach ($test in $testCases) {
    Write-Host "`n$($test.Name):" -ForegroundColor Cyan
    Write-Host "  Index: $($test.Index)" -ForegroundColor Gray
    
    # Build query based on actual field mappings
    $query = @{
        query = @{
            bool = @{
                must = @()
                should = @()
            }
        }
        size = 10
        _source = $true
    }
    
    # Map fields based on server
    switch ($test.Country) {
        "AU" {
            # Australia uses PER_First_Name, PER_Last_Name, PER_DOB, etc.
            if ($test.Data.firstName) {
                $query.query.bool.must += @{
                    match = @{
                        "PER_First_Name" = @{
                            query = $test.Data.firstName
                            fuzziness = "AUTO"
                        }
                    }
                }
            }
            if ($test.Data.lastName) {
                $query.query.bool.must += @{
                    match = @{
                        "PER_Last_Name" = @{
                            query = $test.Data.lastName
                            fuzziness = "AUTO"
                        }
                    }
                }
            }
            if ($test.Data.dateOfBirth) {
                # Convert date to numeric format (YYYYMMDD)
                $dobNumeric = $test.Data.dateOfBirth.Replace("-", "")
                $query.query.bool.should += @{
                    term = @{ "PER_DOB" = [int]$dobNumeric }
                }
            }
            if ($test.Data.email) {
                $query.query.bool.should += @{
                    match = @{ "PER_Email" = $test.Data.email }
                }
            }
            if ($test.Data.mobile) {
                # Remove leading 0 and convert to number
                $mobileNumeric = $test.Data.mobile.TrimStart('0')
                $query.query.bool.should += @{
                    term = @{ "PER_Mobile" = [double]$mobileNumeric }
                }
            }
        }
        "ID" {
            # Indonesia uses Given_Name1-7, FULL_NAME, DOB
            if ($test.Data.firstName) {
                $query.query.bool.must += @{
                    multi_match = @{
                        query = $test.Data.firstName
                        fields = @("Given_Name1^3", "Given_Name2^2", "Given_Name3", "FULL_NAME")
                        type = "best_fields"
                        fuzziness = "AUTO"
                    }
                }
            }
            if ($test.Data.lastName) {
                $query.query.bool.should += @{
                    match = @{
                        "FULL_NAME" = @{
                            query = "$($test.Data.firstName) $($test.Data.lastName)"
                            operator = "and"
                        }
                    }
                }
            }
            if ($test.Data.dateOfBirth) {
                $query.query.bool.should += @{
                    term = @{ "DOB" = $test.Data.dateOfBirth }
                }
            }
        }
        "MY" {
            # Malaysia uses given_name_1-6, full_name, dob_yyyymmdd, National_ID
            if ($test.Data.firstName) {
                $query.query.bool.must += @{
                    multi_match = @{
                        query = $test.Data.firstName
                        fields = @("given_name_1^3", "given_name_2^2", "full_name")
                        type = "best_fields"
                        fuzziness = "AUTO"
                    }
                }
            }
            if ($test.Data.lastName) {
                $query.query.bool.should += @{
                    match = @{
                        "full_name" = @{
                            query = "$($test.Data.firstName) $($test.Data.lastName)"
                            operator = "and"
                        }
                    }
                }
            }
            if ($test.Data.dateOfBirth) {
                $query.query.bool.should += @{
                    term = @{ "dob_yyyymmdd" = $test.Data.dateOfBirth }
                }
            }
            if ($test.Data.nationalId) {
                $query.query.bool.should += @{
                    term = @{ "National_ID" = $test.Data.nationalId }
                }
            }
        }
        "JP" {
            # Japan uses given_name_romaji, Surname_romaji, birthday, full_name
            if ($test.Data.firstName) {
                $query.query.bool.must += @{
                    multi_match = @{
                        query = $test.Data.firstName
                        fields = @("given_name_romaji^3", "given_name^3", "full_name")
                        type = "best_fields"
                        fuzziness = "AUTO"
                    }
                }
            }
            if ($test.Data.lastName) {
                $query.query.bool.must += @{
                    multi_match = @{
                        query = $test.Data.lastName
                        fields = @("Surname_romaji^3", "full_name")
                        type = "best_fields"
                        fuzziness = "AUTO"
                    }
                }
            }
            if ($test.Data.dateOfBirth) {
                # Convert to YYYYMMDD format
                $dobFormatted = $test.Data.dateOfBirth.Replace("-", "")
                $query.query.bool.should += @{
                    term = @{ "birthday" = $dobFormatted }
                }
            }
        }
    }
    
    # Ensure we have at least one should match if any should clauses exist
    if ($query.query.bool.should.Count -gt 0) {
        $query.query.bool.minimum_should_match = 1
    }
    
    try {
        $body = $query | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "http://localhost:$($test.Port)/$($test.Index)/_search" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.hits.total.value -gt 0) {
            Write-Host "  ✓ Found $($response.hits.total.value) matches" -ForegroundColor Green
            $topHit = $response.hits.hits[0]
            Write-Host "    Top match score: $($topHit._score)" -ForegroundColor Gray
            
            # Show relevant fields based on country
            $source = $topHit._source
            Write-Host "    Matched record:" -ForegroundColor Gray
            
            switch ($test.Country) {
                "AU" {
                    if ($source.PER_First_Name) { Write-Host "      First Name: $($source.PER_First_Name)" -ForegroundColor DarkGray }
                    if ($source.PER_Last_Name) { Write-Host "      Last Name: $($source.PER_Last_Name)" -ForegroundColor DarkGray }
                    if ($source.PER_DOB) { Write-Host "      DOB: $($source.PER_DOB)" -ForegroundColor DarkGray }
                    if ($source.PER_Email) { Write-Host "      Email: $($source.PER_Email)" -ForegroundColor DarkGray }
                    if ($source.PER_Mobile) { Write-Host "      Mobile: $($source.PER_Mobile)" -ForegroundColor DarkGray }
                }
                "ID" {
                    if ($source.FULL_NAME) { Write-Host "      Full Name: $($source.FULL_NAME)" -ForegroundColor DarkGray }
                    if ($source.Given_Name1) { Write-Host "      Given Name 1: $($source.Given_Name1)" -ForegroundColor DarkGray }
                    if ($source.DOB) { Write-Host "      DOB: $($source.DOB)" -ForegroundColor DarkGray }
                }
                "MY" {
                    if ($source.full_name) { Write-Host "      Full Name: $($source.full_name)" -ForegroundColor DarkGray }
                    if ($source.given_name_1) { Write-Host "      Given Name 1: $($source.given_name_1)" -ForegroundColor DarkGray }
                    if ($source.National_ID) { Write-Host "      National ID: $($source.National_ID)" -ForegroundColor DarkGray }
                    if ($source.dob_yyyymmdd) { Write-Host "      DOB: $($source.dob_yyyymmdd)" -ForegroundColor DarkGray }
                }
                "JP" {
                    if ($source.full_name) { Write-Host "      Full Name: $($source.full_name)" -ForegroundColor DarkGray }
                    if ($source.given_name_romaji) { Write-Host "      Given Name: $($source.given_name_romaji)" -ForegroundColor DarkGray }
                    if ($source.Surname_romaji) { Write-Host "      Surname: $($source.Surname_romaji)" -ForegroundColor DarkGray }
                    if ($source.birthday) { Write-Host "      Birthday: $($source.birthday)" -ForegroundColor DarkGray }
                }
            }
        } else {
            Write-Host "  ⚠ No matches found" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ✗ Search failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "Testing complete!" -ForegroundColor Green