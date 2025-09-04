# 📊 ACM Team Metrics Dashboard

A comprehensive metrics dashboard for tracking **Advanced Cluster Management (ACM)** team velocity, feature completion, bug resolution rates, and overall development performance.

## 🎯 What It Tracks

### **Team Velocity Metrics**
- **Story Points**: Estimated and completed work
- **Throughput**: Features, bugs, and PRs per week
- **Cycle Time**: Average time from start to completion
- **Lead Time**: Time from creation to delivery

### **Feature Completion**
- Features completed vs. planned
- Completion rate trends
- Feature complexity analysis
- Monthly completion patterns

### **Bug Resolution**
- Bug resolution rate and speed
- Average resolution time
- Priority-based analysis
- Resolution trends over time

### **Code Quality**
- Pull request metrics
- Code review times
- Commit activity
- Files changed per commit

### **Team Health**
- Overall health score (0-100)
- Team contribution analysis
- Workload distribution
- Performance recommendations

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+
- GitHub Personal Access Token with `repo` permissions

### **Installation**
```bash
cd tools/acm-metrics-dashboard
npm install
```

### **Setup**
```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Run setup wizard
npm run setup
```

### **Start Dashboard**
```bash
npm start
```

Visit `http://localhost:3001` to view the dashboard.

## 📈 Dashboard Features

### **Real-time Metrics**
- **Overall Completion Rate**: Combined feature and bug completion
- **Features Completed**: Progress on new features and enhancements
- **Bugs Resolved**: Bug fixing velocity and resolution rates
- **PRs Merged**: Code review and merge efficiency
- **Cycle Time**: Average time to complete work items
- **Team Health Score**: Overall team performance indicator

### **Interactive Charts**
- **Historical Trends**: 6-month trend analysis
- **Team Contributions**: Individual contributor metrics
- **Work Breakdown**: Distribution of completed work types

### **Smart Recommendations**
- Performance improvement suggestions
- Process optimization recommendations
- Workload balancing insights

## ⚙️ Configuration

### **Environment Variables**
```bash
# Required
GITHUB_TOKEN=your_github_token_here

# Optional
METRICS_PORT=3001                    # Dashboard port
DEFAULT_PERIOD=month                 # Default time period
MAX_CONTRIBUTORS=10                  # Max contributors to show
HEALTH_SCORE_THRESHOLD=80           # Health score threshold
DATA_RETENTION_DAYS=90              # How long to keep data
```

### **Time Periods**
- `week` - Last 7 days
- `month` - Last 30 days (default)
- `quarter` - Last 90 days

## 🔄 Data Collection

### **Manual Collection**
```bash
# Collect metrics once
npm run collect

# Collect with specific period
npm run collect -- --period=week
```

### **Automated Collection**
```bash
# Run as daemon (collects every 4 hours)
npm run collect -- --daemon

# Weekly summary
npm run collect-weekly
```

### **Scheduled Collection (Cron)**
```bash
# Add to crontab for automated collection
0 */4 * * * cd /path/to/acm-metrics-dashboard && npm run collect
0 9 * * * cd /path/to/acm-metrics-dashboard && npm run collect-weekly
```

## 📊 API Endpoints

### **Metrics APIs**
- `GET /api/velocity?period=month` - Team velocity metrics
- `GET /api/features?period=month` - Feature completion metrics
- `GET /api/bugs?period=month` - Bug resolution metrics
- `GET /api/pull-requests?period=month` - PR metrics
- `GET /api/code-quality?period=month` - Code quality metrics
- `GET /api/summary?period=month` - Complete team summary
- `GET /api/trends?months=6` - Historical trends

### **Utility APIs**
- `POST /api/refresh` - Manual data refresh
- `GET /api/export?format=csv&period=month` - Export data
- `GET /health` - Health check

## 🎨 Dashboard Customization

### **Adding Custom Metrics**
1. Extend `MetricsCollector` class in `src/metrics-collector.js`
2. Add new API endpoints in `src/server.js`
3. Update dashboard UI in `public/dashboard.js`

### **Custom Charts**
```javascript
// Add to dashboard.js
updateCustomChart() {
    const ctx = document.getElementById('customChart').getContext('2d')
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Label 1', 'Label 2'],
            datasets: [{
                label: 'Custom Metric',
                data: [10, 20],
                backgroundColor: '#667eea'
            }]
        }
    })
}
```

## 📋 Metrics Explained

### **Story Points Estimation**
Features are automatically assigned story points based on:
- Comment count (complexity indicator)
- Labels (`epic`, `complex`, etc.)
- Title keywords (`refactor`, `migration`)

### **Health Score Calculation**
```javascript
healthScore = 100
- (feature completion < 70% ? -20 : 0)
- (bug resolution < 80% ? -15 : 0)
- (PR merge rate < 85% ? -10 : 0)
- (feature cycle time > 14 days ? -15 : 0)
- (bug resolution time > 7 days ? -10 : 0)
```

### **Cycle Time**
- **Features**: From creation to closure
- **Bugs**: From creation to resolution
- **PRs**: From creation to merge

## 🛠 Troubleshooting

### **Common Issues**

**GitHub API Rate Limits**
```bash
# Check your rate limit
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

**No Data Showing**
1. Verify GitHub token permissions
2. Check if repository has recent activity
3. Run manual collection: `npm run collect`

**Dashboard Not Loading**
1. Check server logs
2. Verify port 3001 is available
3. Try different port: `METRICS_PORT=3002 npm start`

### **Debug Mode**
```bash
DEBUG=* npm start
```

## 🔐 Security

- GitHub tokens are stored in environment variables only
- No sensitive data is logged
- API responses don't include token information
- Local data storage only (no external services)

## 📈 Team Usage Examples

### **Sprint Planning**
- Review velocity trends to plan sprint capacity
- Analyze cycle times to estimate feature completion
- Check team health score for workload balancing

### **Retrospectives**
- Compare completion rates across sprints
- Identify bottlenecks in the development process
- Review team contribution patterns

### **Management Reporting**
- Export monthly metrics for stakeholder reports
- Track feature delivery against commitments
- Monitor bug resolution SLAs

## 🤝 Contributing

### **Adding New Metrics**
1. Fork the repository
2. Add metric collection logic to `MetricsCollector`
3. Create API endpoint in `server.js`
4. Update dashboard UI
5. Add tests and documentation

### **Reporting Issues**
- Use GitHub issues for bug reports
- Include environment details and error logs
- Provide steps to reproduce

## 📚 Advanced Usage

### **CI/CD Integration**
```yaml
# .github/workflows/metrics.yml
name: Collect Metrics
on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd tools/acm-metrics-dashboard && npm ci
      - run: npm run collect
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### **Slack Integration**
```bash
# Add to collect-metrics.js
const webhook = process.env.SLACK_WEBHOOK
if (webhook) {
  await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
      text: `📊 Daily ACM Metrics: ${summary}`
    })
  })
}
```

### **Custom Alerts**
```javascript
// Add to velocity-calculator.js
generateAlerts() {
  const alerts = []
  
  if (this.healthScore < 60) {
    alerts.push({
      type: 'critical',
      message: 'Team health score is critically low'
    })
  }
  
  return alerts
}
```

## 🔮 Roadmap

- [ ] Slack/Teams integration for alerts
- [ ] Jira integration for additional metrics
- [ ] Mobile-responsive dashboard
- [ ] Custom dashboard themes
- [ ] Advanced filtering and search
- [ ] Predictive analytics
- [ ] Team comparison views
- [ ] Export to PDF reports

---

**Built for the ACM team with ❤️**

For questions or support, contact the ACM development team.
