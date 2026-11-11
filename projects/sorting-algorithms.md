# Sorting Algorithms and Memory Trade-offs

Singapore Polytechnic team project by Shajesh Mogan and Titus Lim.

We compared Bubble, Merge, Quick, and Heap Sort in Python. We ran each algorithm on copies of the same inputs, checked the results against Python's sorted(), and counted comparisons between values. On the generated 100,000-element input, Quick Sort made about 26% fewer comparisons than Heap Sort. That result describes the tested input and implementations.

## My contribution

I analysed which implementations met a strict constant auxiliary space requirement. For a simulated logger with 512 KiB of memory and 100,000 fixed-width 32-bit readings, I recommended Heap Sort. Our implementation reuses the input array with constant auxiliary space and guarantees O(n log n) worst-case time. The memory estimate assumes packed readings in the logger scenario. The Python benchmarks measured comparisons.
