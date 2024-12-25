import XCTest
import SwiftTreeSitter
import TreeSitterGap

final class TreeSitterGapTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_gap())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading gap grammar")
    }
}
