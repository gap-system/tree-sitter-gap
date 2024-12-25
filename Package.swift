// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterGap",
    defaultLocalization: "en",
    products: [
        .library(name: "TreeSitterGap", targets: ["TreeSitterGap"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(name: "TreeSitterGap",
                dependencies: [],
                path: ".",
                sources: [
                    "src/parser.c",
                    "src/scanner.c",
                ],
                resources: [
                    .copy("queries")
                ],
                publicHeadersPath: "bindings/swift",
                cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterGapTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterGap",
            ],
            path: "bindings/swift/TreeSitterGapTests"
        )
    ],
    cLanguageStandard: .c11
)
