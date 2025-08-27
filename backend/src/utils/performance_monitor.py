import time
import threading
import logging
from collections import deque, defaultdict
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """
    Real-time performance monitoring for quantum random generation.
    Tracks throughput, latency, and quality metrics.
    """
    
    def __init__(self, history_size: int = 1000):
        self.history_size = history_size
        self.logger = logger
        
        # Thread-safe data structures
        self.lock = threading.Lock()
        
        # Generation history
        self.generation_history = deque(maxlen=history_size)
        self.throughput_history = deque(maxlen=history_size)
        self.latency_history = deque(maxlen=history_size)
        
        # Real-time metrics
        self.current_metrics = {
            'instantaneous_throughput_mbps': 0.0,
            'average_throughput_mbps': 0.0,
            'peak_throughput_mbps': 0.0,
            'average_latency_ms': 0.0,
            'requests_per_second': 0.0,
            'active_connections': 0,
            'total_bytes_generated': 0,
            'total_requests': 0,
            'uptime_seconds': 0
        }
        
        # Source-specific statistics
        self.source_stats = defaultdict(lambda: {
            'requests': 0,
            'bytes_generated': 0,
            'total_time': 0.0,
            'average_throughput_mbps': 0.0,
            'error_count': 0
        })
        
        # Quality metrics
        self.quality_metrics = {
            'entropy_scores': deque(maxlen=100),
            'uniformity_scores': deque(maxlen=100),
            'correlation_scores': deque(maxlen=100),
            'last_quality_check': None
        }
        
        # Time tracking
        self.start_time = datetime.utcnow()
        self.last_request_time = None
        self.request_timestamps = deque(maxlen=60)  # Last 60 requests for RPS calculation
        
        # Background monitoring
        self.monitoring_active = True
        self._start_monitoring_thread()
    
    def _start_monitoring_thread(self):
        """Start background thread for real-time metrics calculation"""
        def monitor_worker():
            while self.monitoring_active:
                try:
                    self._update_real_time_metrics()
                    time.sleep(1)  # Update every second
                except Exception as e:
                    self.logger.error(f"Error in monitoring thread: {str(e)}")
                    time.sleep(5)
        
        thread = threading.Thread(target=monitor_worker, daemon=True)
        thread.start()
        self.logger.info("Performance monitoring started")
    
    def record_generation(self, size_bytes: int, generation_time: float, source: str = 'unknown'):
        """
        Record a random generation event.
        
        Args:
            size_bytes: Number of bytes generated
            generation_time: Time taken in seconds
            source: Source of generation ('fpga', 'anu', etc.)
        """
        timestamp = datetime.utcnow()
        throughput_mbps = (size_bytes * 8) / (generation_time * 1_000_000) if generation_time > 0 else 0
        
        with self.lock:
            # Add to history
            self.generation_history.append({
                'timestamp': timestamp,
                'size_bytes': size_bytes,
                'generation_time': generation_time,
                'throughput_mbps': throughput_mbps,
                'source': source
            })
            
            self.throughput_history.append(throughput_mbps)
            self.latency_history.append(generation_time * 1000)  # Convert to ms
            self.request_timestamps.append(timestamp)
            
            # Update source statistics
            stats = self.source_stats[source]
            stats['requests'] += 1
            stats['bytes_generated'] += size_bytes
            stats['total_time'] += generation_time
            
            if stats['total_time'] > 0:
                stats['average_throughput_mbps'] = (
                    stats['bytes_generated'] * 8
                ) / (stats['total_time'] * 1_000_000)
            
            # Update global counters
            self.current_metrics['total_bytes_generated'] += size_bytes
            self.current_metrics['total_requests'] += 1
            self.last_request_time = timestamp
    
    def record_quality_metrics(self, entropy: float, uniformity: float, correlation: float):
        """Record quality metrics for generated data"""
        with self.lock:
            self.quality_metrics['entropy_scores'].append(entropy)
            self.quality_metrics['uniformity_scores'].append(uniformity)
            self.quality_metrics['correlation_scores'].append(correlation)
            self.quality_metrics['last_quality_check'] = datetime.utcnow()
    
    def _update_real_time_metrics(self):
        """Update real-time performance metrics"""
        with self.lock:
            current_time = datetime.utcnow()
            
            # Calculate uptime
            self.current_metrics['uptime_seconds'] = (
                current_time - self.start_time
            ).total_seconds()
            
            # Calculate requests per second (last 60 seconds)
            recent_requests = [
                ts for ts in self.request_timestamps
                if (current_time - ts).total_seconds() <= 60
            ]
            self.current_metrics['requests_per_second'] = len(recent_requests) / 60.0
            
            # Calculate throughput metrics
            if self.throughput_history:
                recent_throughput = list(self.throughput_history)[-10:]  # Last 10 measurements
                self.current_metrics['instantaneous_throughput_mbps'] = np.mean(recent_throughput)
                self.current_metrics['average_throughput_mbps'] = np.mean(list(self.throughput_history))
                self.current_metrics['peak_throughput_mbps'] = max(self.throughput_history)
            
            # Calculate latency metrics
            if self.latency_history:
                self.current_metrics['average_latency_ms'] = np.mean(list(self.latency_history))
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics"""
        with self.lock:
            stats = {
                'timestamp': datetime.utcnow().isoformat(),
                'uptime_seconds': self.current_metrics['uptime_seconds'],
                'real_time_metrics': self.current_metrics.copy(),
                'source_statistics': dict(self.source_stats),
                'quality_metrics': self._get_quality_summary(),
                'throughput_distribution': self._get_throughput_distribution(),
                'latency_distribution': self._get_latency_distribution(),
                'recent_activity': self._get_recent_activity()
            }
        return stats
    
    def get_real_time_throughput(self) -> Dict[str, Any]:
        """Get real-time throughput data for dashboard"""
        with self.lock:
            # Get last 60 data points for chart
            recent_history = list(self.generation_history)[-60:]
            
            throughput_data = [
                {
                    'timestamp': event['timestamp'].isoformat(),
                    'throughput_mbps': event['throughput_mbps'],
                    'size_bytes': event['size_bytes'],
                    'source': event['source']
                }
                for event in recent_history
            ]
            
            return {
                'current_throughput_mbps': self.current_metrics['instantaneous_throughput_mbps'],
                'target_throughput_mbps': 50.0,  # Target from config
                'peak_throughput_mbps': self.current_metrics['peak_throughput_mbps'],
                'average_throughput_mbps': self.current_metrics['average_throughput_mbps'],
                'throughput_efficiency': min(
                    self.current_metrics['average_throughput_mbps'] / 50.0 * 100, 100
                ),
                'historical_data': throughput_data,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _get_quality_summary(self) -> Dict[str, Any]:
        """Get summary of quality metrics"""
        quality = self.quality_metrics
        
        summary = {
            'last_check': quality['last_quality_check'].isoformat() if quality['last_quality_check'] else None,
            'sample_count': len(quality['entropy_scores'])
        }
        
        if quality['entropy_scores']:
            summary['entropy'] = {
                'current': quality['entropy_scores'][-1],
                'average': np.mean(list(quality['entropy_scores'])),
                'min': min(quality['entropy_scores']),
                'max': max(quality['entropy_scores'])
            }
        
        if quality['uniformity_scores']:
            summary['uniformity'] = {
                'current': quality['uniformity_scores'][-1],
                'average': np.mean(list(quality['uniformity_scores'])),
                'min': min(quality['uniformity_scores']),
                'max': max(quality['uniformity_scores'])
            }
        
        if quality['correlation_scores']:
            summary['correlation'] = {
                'current': quality['correlation_scores'][-1],
                'average': np.mean(list(quality['correlation_scores'])),
                'min': min(quality['correlation_scores']),
                'max': max(quality['correlation_scores'])
            }
        
        return summary
    
    def _get_throughput_distribution(self) -> Dict[str, Any]:
        """Get throughput distribution statistics"""
        if not self.throughput_history:
            return {}
        
        throughput_array = np.array(list(self.throughput_history))
        
        return {
            'mean': float(np.mean(throughput_array)),
            'median': float(np.median(throughput_array)),
            'std': float(np.std(throughput_array)),
            'min': float(np.min(throughput_array)),
            'max': float(np.max(throughput_array)),
            'percentiles': {
                'p25': float(np.percentile(throughput_array, 25)),
                'p50': float(np.percentile(throughput_array, 50)),
                'p75': float(np.percentile(throughput_array, 75)),
                'p90': float(np.percentile(throughput_array, 90)),
                'p95': float(np.percentile(throughput_array, 95)),
                'p99': float(np.percentile(throughput_array, 99))
            }
        }
    
    def _get_latency_distribution(self) -> Dict[str, Any]:
        """Get latency distribution statistics"""
        if not self.latency_history:
            return {}
        
        latency_array = np.array(list(self.latency_history))
        
        return {
            'mean_ms': float(np.mean(latency_array)),
            'median_ms': float(np.median(latency_array)),
            'std_ms': float(np.std(latency_array)),
            'min_ms': float(np.min(latency_array)),
            'max_ms': float(np.max(latency_array)),
            'percentiles': {
                'p50': float(np.percentile(latency_array, 50)),
                'p90': float(np.percentile(latency_array, 90)),
                'p95': float(np.percentile(latency_array, 95)),
                'p99': float(np.percentile(latency_array, 99))
            }
        }
    
    def _get_recent_activity(self) -> List[Dict[str, Any]]:
        """Get recent generation activity"""
        recent_events = list(self.generation_history)[-20:]  # Last 20 events
        
        return [
            {
                'timestamp': event['timestamp'].isoformat(),
                'size_bytes': event['size_bytes'],
                'throughput_mbps': round(event['throughput_mbps'], 2),
                'latency_ms': round(event['generation_time'] * 1000, 2),
                'source': event['source']
            }
            for event in recent_events
        ]
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get system health indicators"""
        with self.lock:
            current_time = datetime.utcnow()
            
            # Check if system is active (received request in last 60 seconds)
            is_active = (
                self.last_request_time and
                (current_time - self.last_request_time).total_seconds() < 60
            )
            
            # Performance health indicators
            avg_throughput = self.current_metrics['average_throughput_mbps']
            target_throughput = 50.0
            throughput_health = min(avg_throughput / target_throughput, 1.0)
            
            # Latency health (lower is better)
            avg_latency = self.current_metrics['average_latency_ms']
            latency_health = max(1.0 - (avg_latency / 1000.0), 0.0)  # Expect < 1 second
            
            # Quality health (if available)
            quality_health = 1.0
            if self.quality_metrics['entropy_scores']:
                recent_entropy = list(self.quality_metrics['entropy_scores'])[-10:]
                avg_entropy = np.mean(recent_entropy)
                quality_health = min(avg_entropy / 8.0, 1.0)  # Max entropy is 8 for 8-bit values
            
            # Overall health score
            overall_health = (throughput_health + latency_health + quality_health) / 3
            
            return {
                'overall_health_score': overall_health,
                'status': 'healthy' if overall_health > 0.8 else 'degraded' if overall_health > 0.5 else 'critical',
                'is_active': is_active,
                'health_indicators': {
                    'throughput_health': throughput_health,
                    'latency_health': latency_health,
                    'quality_health': quality_health
                },
                'last_activity': self.last_request_time.isoformat() if self.last_request_time else None,
                'uptime_seconds': self.current_metrics['uptime_seconds'],
                'timestamp': current_time.isoformat()
            }
    
    def reset_statistics(self):
        """Reset all performance statistics"""
        with self.lock:
            self.generation_history.clear()
            self.throughput_history.clear()
            self.latency_history.clear()
            self.request_timestamps.clear()
            
            for key in self.current_metrics:
                if 'total' in key or 'uptime' in key:
                    self.current_metrics[key] = 0
                else:
                    self.current_metrics[key] = 0.0
            
            self.source_stats.clear()
            
            for key in self.quality_metrics:
                if isinstance(self.quality_metrics[key], deque):
                    self.quality_metrics[key].clear()
                else:
                    self.quality_metrics[key] = None
            
            self.start_time = datetime.utcnow()
            self.last_request_time = None
        
        self.logger.info("Performance statistics reset")
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring_active = False
        self.logger.info("Performance monitoring stopped")