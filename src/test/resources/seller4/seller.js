function scoreAd(adMetadata, bid, auctionConfig, trustedScoringSignals, browserSignals) {
  return { "desirabilityScore" : bid };
}

function reportResult(auctionConfig, browserSignals) {
  var signals = {
    "auctionConfig": auctionConfig,
    "browserSignals": browserSignals
  };
  sendReportTo("https://fledge-tests.creativecdn.net:9012/reportResult?signals=" + encodeURIComponent(JSON.stringify(signals)));
}
