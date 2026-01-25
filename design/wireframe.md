Main Layout (Desktop)
=====================

+----------------------------------------------------------------------------------+
| HEADER: Local Multi-Agent Boss Dashboard                         [Local] [●Live]|
+----------------------------------------------------------------------------------+
|                                                                                  |
|  AGENT LIST PANEL           |         AGENT DETAIL PANEL          | APPROVALS    |
|  (left)                     |         (center, main)              | QUEUE (right)|
|                             |                                     |              |
|  +-----------------------+  | +---------------------------------+ |+-----------+ |
|  | Agents          [N]   |  | | Agent Name           [STATUS]   | ||Pending 3| |
|  | [search box]         |  | | Last task • Updated 14:23:10    | |+-----------+|
|  +-----------------------+  | +---------------------------------+ || Item 1  | |
|  | > Agent A   [running]|  | | METRICS & CONTROLS              | || Agent X | |
|  |   Last: Summarize... |  | | +---------------------------+   | || Task #12| |
|  |   Step: Generating   |  | | | Total tasks   |  12       |   | || "Output"| |
|  |   12 tasks • 83%     |  | | | Success/Fail  |  10 / 2   |   | || [Reject]| |
|  |----------------------|  | | | Avg duration  |  3.2s     |   | || [Approve]|
|  |   Agent B [idle]     |  | | | Tokens/Cost   | 3.2K/$0.05|   | |+-----------+
|  |   Last: –            |  | | +---------------------------+   | |    ...     |
|  |   Step: –            |  | |                               |  |            |
|  |   0 tasks • –        |  | | New task: [ textarea       ] |  |            |
|  |----------------------|  | | [Start] [Stop] [Retry] [Pause] |  |            |
|  |   ...                |  | +---------------------------------+ |            |
|  |                      |  | | Logs [Auto-scroll ON] [Clear]   | |            |
|  +----------------------+  | | +-----------------------------+  | |            |
|                             | | 14:23:11 [info] Started task  | | |            |
|                             | | 14:23:12 [info] Step 1...     | | |            |
|                             | | 14:23:15 [warn] Awaiting ...  | | |            |
|                             | | ... (scrollable)              | | |            |
|                             | |                             v | | |            |
|                             | +-----------------------------+  | |            |
+----------------------------------------------------------------------------------+
| GLOBAL METRICS: Total tasks 123 | Success 110 | Failures 13 | Avg 2.8s |       |
|                Tokens 45.3K | Cost $0.76                                      |
+----------------------------------------------------------------------------------+
