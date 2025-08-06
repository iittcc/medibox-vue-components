# Problem/Feature Solution Analysis Framework

## Instructions

1. **No Code Implementation** - Focus on analysis and design only
2. **Problem Definition** - Clearly articulate the problem/feature request
3. **Assumptions** - List specific, testable assumptions
4. **Acceptance Criteria** - Define measurable success conditions
5. **Impact Analysis** - Identify all affected components
6. **Technical Debt Assessment** - Evaluate debt creation/reduction
7. **Solution Generation** - Propose multiple viable approaches
8. **Comparative Analysis** - Systematic solution evaluation
9. **Risk Assessment** - Analyze failure modes and impacts
10. **Recommendation** - Data-driven solution selection
11. **Clarification** - Request additional information if needed

---

## Analysis Template

### 1. Problem/Feature Definition
**What exactly needs to be solved or implemented?**
- [ ] Business context and motivation
- [ ] Current state vs. desired state
- [ ] Success metrics and KPIs
- [ ] Constraints and limitations

### 2. Assumptions
**List specific, verifiable assumptions:**
- [ ] Technical assumptions (APIs, databases, frameworks)
- [ ] Business assumptions (user behavior, volume, frequency)
- [ ] Resource assumptions (time, budget, team size)
- [ ] Environmental assumptions (infrastructure, dependencies)

### 3. Acceptance Criteria
**Measurable conditions for completion:**
- [ ] Functional requirements (what it must do)
- [ ] Non-functional requirements (performance, security, usability)
- [ ] Quality gates (test coverage, documentation)
- [ ] Rollback/recovery criteria

### 4. Impact Analysis
**Identify affected components using dependency analysis:**
- [ ] **Direct impacts:** Files/modules requiring changes
- [ ] **Indirect impacts:** Dependencies and dependents
- [ ] **Data impacts:** Database schema, migrations, data flow
- [ ] **Integration impacts:** APIs, third-party services, external systems
- [ ] **Infrastructure impacts:** Deployment, monitoring, scaling

### 5. Technical Debt Assessment
- [ ] **Creates debt:** New complexity, shortcuts, maintenance burden
- [ ] **Reduces debt:** Consolidation, refactoring, standardization
- [ ] **Neutral:** No significant impact on codebase quality

### 6. Solution Alternatives
**Generate 3-5 distinct approaches:**
- Solution A: [Brief description]
- Solution B: [Brief description]
- Solution C: [Brief description]
- Solution D: [Brief description] *(if applicable)*

### 7. Solution Comparison Matrix

| Criteria | Weight | Solution A | Solution B | Solution C | Solution D |
|----------|--------|------------|------------|------------|------------|
| **Architecture Principles** | | | | | |
| KISS (Keep It Simple) | 15% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| DRY (Don't Repeat Yourself) | 10% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| YAGNI (You Aren't Gonna Need It) | 10% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| **Quality Metrics** | | | | | |
| Module Independence (1-5) | 20% | X/5 | X/5 | X/5 | X/5 |
| Code Clarity (1-5) | 15% | X/5 | X/5 | X/5 | X/5 |
| Component Reusability (1-5) | 10% | X/5 | X/5 | X/5 | X/5 |
| Test Coverage Potential (1-5) | 10% | X/5 | X/5 | X/5 | X/5 |
| **Non-Functional** | | | | | |
| Performance Impact | 5% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| Scalability | 5% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| Security Considerations | 10% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| Development Effort | 15% | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 | 🟢/🟡/🔴 |
| **Total Weighted Score** | 100% | **X.X** | **X.X** | **X.X** | **X.X** |
| **Confidence Level** | | X% | X% | X% | X% |

### 8. Risk Analysis
**For each solution, analyze:**

#### Solution A
- **Pros:** [List advantages]
- **Cons:** [List disadvantages]
- **What could go wrong?** [Failure scenarios and mitigation strategies]
- **Risk Level:** 🟢/🟡/🔴

#### Solution B
- **Pros:** [List advantages]
- **Cons:** [List disadvantages]
- **What could go wrong?** [Failure scenarios and mitigation strategies]
- **Risk Level:** 🟢/🟡/🔴

*[Continue for all solutions]*

### 9. Visual Architecture (When Applicable)
```
[Include relevant diagrams:]
- System architecture diagrams
- Data flow diagrams
- Sequence diagrams
- Component interaction diagrams
- Before/after state diagrams
```
### 10. Recommendation & Justification

**Selected Solution:** [Solution X]

**Justification:**
- **Score:** X.X/5.0 (highest weighted score)
- **Key strengths:** [Primary advantages]
- **Acceptable trade-offs:** [Acknowledged limitations]
- **Risk mitigation:** [How risks will be addressed]
- **Alignment with constraints:** [How it meets requirements]

**Implementation Priority:** High/Medium/Low
**Estimated Complexity:** High/Medium/Low
**Recommended Timeline:** [Time estimate]

### 11. Next Steps
- [ ] **Immediate actions required**
- [ ] **Prerequisites to resolve**
- [ ] **Additional information needed**
- [ ] **Stakeholder approvals required**
- [ ] **Proof of concept recommendations**

---

## Scoring Legend
- **🟢 High (4-5):** Excellent/Optimal
- **🟡 Medium (2-3):** Acceptable/Adequate  
- **🔴 Low (1-2):** Poor/Concerning

## Quality Gates
Before proceeding, ensure:
- [ ] All assumptions are documented and validated
- [ ] Impact analysis is comprehensive
- [ ] At least 3 viable solutions are considered
- [ ] Risk assessment includes failure scenarios
- [ ] Recommendation is data-driven with clear justification
