export default (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString()
}
