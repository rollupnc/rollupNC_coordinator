/*

1. read deposit subtree root from smart contract
2. determine height, h, of deposit subtree
3. find earliest empty subtree at h
4. get Merkle proof for h (using zeroCache)
5. submit Merkle proof to smart contract
6. insert confirmed deposits into accounts database

*/