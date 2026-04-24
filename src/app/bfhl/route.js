import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const data = body.data || [];

        const valid_edges = [];
        const invalid_entries = [];

        const formatRegex = /^[A-Z]->[A-Z]$/;

        for (const item of data) {
            if (typeof item !== 'string') {
                invalid_entries.push(item);
                continue;
            }
            const trimmed = item.trim();
            if (formatRegex.test(trimmed)) {
                const parts = trimmed.split('->');
                if (parts[0] !== parts[1]) {
                    valid_edges.push(trimmed);
                } else {
                    invalid_entries.push(trimmed); // self loop invalid
                }
            } else {
                invalid_entries.push(trimmed || item);
            }
        }

        const seen_edges = new Set();
        const duplicate_edges_set = new Set();
        const unique_valid_edges = [];

        for (const edge of valid_edges) {
            if (seen_edges.has(edge)) {
                duplicate_edges_set.add(edge);
            } else {
                seen_edges.add(edge);
                unique_valid_edges.push(edge);
            }
        }
        const duplicate_edges = Array.from(duplicate_edges_set);

        const parents = new Map();
        const children = new Map();
        const all_nodes = new Set();

        // Multi parent conflict resolution
        for (const edge of unique_valid_edges) {
            const [u, v] = edge.split('->');
            all_nodes.add(u);
            all_nodes.add(v);

            if (!children.has(u)) children.set(u, []);
            if (!children.has(v)) children.set(v, []);

            if (!parents.has(v)) {
                parents.set(v, u);
                children.get(u).push(v);
            }
            // else: silently discard subsequent parent edges
        }

        const global_roots = [];
        for (const node of all_nodes) {
            if (!parents.has(node)) {
                global_roots.push(node);
            }
        }

        // Sort roots alphabetically just for reproducibility (optional)
        global_roots.sort();

        const buildSubtree = (node) => {
            const tree = {};
            const childList = children.get(node) || [];
            for (const child of childList) {
                tree[child] = buildSubtree(child);
            }
            return tree;
        };

        const buildTree = (root) => {
            const subtree = buildSubtree(root);
            return { [root]: subtree };
        };

        const getDepth = (root) => {
            let maxChildDepth = 0;
            const childList = children.get(root) || [];
            for (const child of childList) {
                maxChildDepth = Math.max(maxChildDepth, getDepth(child));
            }
            return 1 + maxChildDepth;
        };

        const visited = new Set();
        const markVisited = (root) => {
            visited.add(root);
            const childList = children.get(root) || [];
            for (const child of childList) {
                if (!visited.has(child)) {
                    markVisited(child);
                }
            }
        };

        const hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let largest_tree_root = "";
        let max_depth = 0;

        for (const root of global_roots) {
            const treeObj = buildTree(root);
            const depth = getDepth(root);
            markVisited(root);

            hierarchies.push({
                root: root,
                tree: treeObj,
                depth: depth
            });

            total_trees++;

            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth) {
                if (largest_tree_root === "" || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }

        // Process pure cycles
        const unvisited = new Set(Array.from(all_nodes).filter(x => !visited.has(x)));

        while (unvisited.size > 0) {
            const node = unvisited.values().next().value;
            // Find all weakly connected components from this node within unvisited
            const component = new Set();
            const queue = [node];
            
            while(queue.length > 0) {
                const curr = queue.shift();
                if (!component.has(curr)) {
                    component.add(curr);
                    // check neighbors (both parents and children)
                    if (parents.has(curr)) {
                       const p = parents.get(curr);
                       if (unvisited.has(p) && !component.has(p)) queue.push(p);
                    }
                    const childList = children.get(curr) || [];
                    for (const c of childList) {
                        if (unvisited.has(c) && !component.has(c)) queue.push(c);
                    }
                }
            }

            // Find lexicographically smallest node
            let smallest = null;
            for (const c of component) {
                if (smallest === null || c < smallest) {
                    smallest = c;
                }
            }

            hierarchies.push({
                root: smallest,
                tree: {},
                has_cycle: true,
            });
            total_cycles++;

            for (const c of component) {
                unvisited.delete(c);
                visited.add(c);
            }
        }

        const responseObj = {
            user_id: "someshdas_17122004",
            email_id: "sd7790@srmist.edu.in",
            college_roll_number: "RA2311003010467",
            hierarchies,
            invalid_entries,
            duplicate_edges,
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root
            }
        };

        return NextResponse.json(responseObj, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON or server error" }, { status: 400 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
