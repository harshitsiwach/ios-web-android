<--- Last few GCs --->

[43580:000002C9E4AAE000]    84428 ms: Scavenge (interleaved) 2033.4 (2068.5) -> 2033.0 (2079.0) MB, pooled: 0 MB, 22.87 / 0.00 ms  (average mu = 0.741, current mu = 0.485) allocation failure;
[43580:000002C9E4AAE000]    84902 ms: Mark-Compact (reduce) 2062.1 (2101.4) -> 2045.5 (2078.0) MB, pooled: 0 MB, 361.79 / 0.00 ms  (+ 1.9 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 443 ms) (average mu = 0.62

<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----

 1: 00007FF79730DA2B node::SetCppgcReference+15611
 2: 00007FF79727AFE4 DSA_meth_get_flags+86548
 3: 00007FF797EDE351 v8::Isolate::ReportExternalAllocationLimitReached+65
 4: 00007FF797ECAF76 v8::Function::Experimental_IsNopFunction+2918
 5: 00007FF797D14DA0 v8::internal::StrongRootAllocatorBase::StrongRootAllocatorBase+31760
 6: 00007FF797D11DAD v8::internal::StrongRootAllocatorBase::StrongRootAllocatorBase+19485
 7: 00007FF797D27613 v8::Isolate::GetHeapProfiler+7267
 8: 00007FF797D27EAA v8::Isolate::GetHeapProfiler+9466
 9: 00007FF797D32FFD v8::Isolate::GetHeapProfiler+54861
10: 00007FF797D46F6C v8::Isolate::GetHeapProfiler+136636
11: 00007FF797BC7214 v8::MemorySpan<std::basic_string_view<char,std::char_traits<char> > const >::end+1126388
12: 00007FF797BE56C0 v8::Context::GetIsolate+12976
13: 00007FF797A0594A v8::internal::Version::GetString+500762
14: 00007FF737F6D5BA