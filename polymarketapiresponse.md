



Correct Market Struct Based on API Response

struct PolymarketMarket: Codable, Identifiable {
    let id: String
    let question: String
    let conditionId: String
    let slug: String
    let twitterCardImage: String?
    let endDate: String
    let category: String
    let liquidity: String
    let image: String?
    let icon: String?
    let description: String
    let outcomes: String // This is a JSON string, not array
    let outcomePrices: String // This is a JSON string, not array
    let volume: String
    let active: Bool
    let marketType: String
    let closed: Bool
    let marketMakerAddress: String
    let updatedBy: Int?
    let createdAt: String
    let updatedAt: String
    let closedTime: String?
    let mailchimpTag: String?
    let archived: Bool
    let restricted: Bool
    let volumeNum: Double
    let liquidityNum: Double
    let endDateIso: String
    let hasReviewedDates: Bool?
    let readyForCron: Bool?
    let volume24hr: Double // This is the correct field name!
    let volume1wk: Double?
    let volume1mo: Double?
    let volume1yr: Double?
    let clobTokenIds: String?
    
    enum CodingKeys: String, CodingKey {
        case id, question, conditionId, slug, twitterCardImage, endDate, category
        case liquidity, image, icon, description, outcomes, outcomePrices, volume
        case active, marketType, closed, marketMakerAddress, updatedBy, createdAt
        case updatedAt, closedTime, mailchimpTag, archived, restricted, volumeNum
        case liquidityNum, endDateIso, hasReviewedDates, readyForCron
        case volume24hr, volume1wk, volume1mo, volume1yr, clobTokenIds
    }
    
    // Computed properties to parse JSON strings
    var parsedOutcomes: [String] {
        guard let data = outcomes.data(using: .utf8),
              let array = try? JSONDecoder().decode([String].self, from: data) else {
            return []
        }
        return array
    }
    
    var parsedOutcomePrices: [String] {
        guard let data = outcomePrices.data(using: .utf8),
              let array = try? JSONDecoder().decode([String].self, from: data) else {
            return ["0", "0"]
        }
        return array
    }
}

Simplified Version (Recommended)
If you want fewer fields to start with:


struct PolymarketMarket: Codable, Identifiable {
    let id: String
    let question: String
    let conditionId: String
    let slug: String
    let endDate: String
    let category: String
    let volume: String
    let active: Bool
    let closed: Bool
    let volumeNum: Double
    let volume24hr: Double // Field exists but named differently
    let outcomes: String // JSON string
    let outcomePrices: String // JSON string
    let image: String?
    let description: String
    
    // Computed properties for easier use
    var parsedOutcomes: [String] {
        guard let data = outcomes.data(using: .utf8),
              let array = try? JSONDecoder().decode([String].self, from: data) else {
            return ["Yes", "No"]
        }
        return array
    }
    
    var parsedPrices: [Double] {
        guard let data = outcomePrices.data(using: .utf8),
              let stringArray = try? JSONDecoder().decode([String].self, from: data) else {
            return [0.0, 0.0]
        }
        return stringArray.compactMap { Double($0) }
    }
    
    var formattedVolume: String {
        if volumeNum >= 1_000_000 {
            return String(format: "$%.1fM", volumeNum / 1_000_000)
        } else if volumeNum >= 1_000 {
            return String(format: "$%.1fK", volumeNum / 1_000)
        } else {
            return String(format: "$%.0f", volumeNum)
        }
    }
}


Key Insights from the API Response:
	1.	`volume24hr` exists as a number, not `volume_24hr` as a string
	2.	`outcomes` and `outcomePrices` are JSON strings, not arrays
	3.	`volumeNum` is the numeric version of volume
	4.	`conditionId` exists (this was missing in your original struct)
	5.	`endDateIso` is the clean date format



updated fetch function

class PolymarketAPI: ObservableObject {
    @Published var markets: [PolymarketMarket] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func fetchTrendingMarkets() async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        let url = URL(string: "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=10")!
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            
            let decoder = JSONDecoder()
            let markets = try decoder.decode([PolymarketMarket].self, from: data)
            
            await MainActor.run {
                self.markets = markets
                self.isLoading = false
            }
            
        } catch {
            print("Error: \(error)")
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
}


display example

struct MarketCard: View {
    let market: PolymarketMarket
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(market.question)
                .font(.headline)
                .lineLimit(2)
            
            HStack {
                Text(market.category.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.blue.opacity(0.2))
                    .cornerRadius(4)
                
                Spacer()
                
                Text(market.formattedVolume)
                    .font(.caption.bold())
                    .foregroundColor(.green)
            }
            
            if market.parsedOutcomes.count >= 2 {
                HStack {
                    ForEach(0..<min(market.parsedOutcomes.count, 2), id: \.self) { index in
                        let outcome = market.parsedOutcomes[index]
                        let price = market.parsedPrices[safe: index] ?? 0.0
                        
                        VStack {
                            Text(outcome)
                                .font(.caption)
                            Text("\(Int(price * 100))%")
                                .font(.caption.bold())
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(12)
    }
}

extension Array {
    subscript(safe index: Index) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

This should fix your decoding error! The main issue was that the API response field names don’t match the typical snake_case to camelCase conversion pattern.