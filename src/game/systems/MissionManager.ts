/**
 * Mission Manager - Handles daily, weekly, and campaign missions in Veggie Clash
 * Manages mission tracking, completion, rewards, and persistence
 */

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'campaign';
    category: 'gold' | 'distance' | 'enemies' | 'powerups' | 'collectibles' | 'survival_timer' | 'elimination';
    target: number;
    current: number;
    rewardType: 'coins' | 'gems' | 'skin' | 'weapon';
    rewardAmount: number;
    isCompleted: boolean;
    isClaimed: boolean;
    // Campaign-specific fields
    waves?: Array<{
        wave: number;
        enemies: Array<{
            type: string;
            count: number;
        }>;
    }>;
    objectives?: {
        type: 'survival_timer' | 'elimination';
        duration_s?: number;
        enemy_total?: number;
        boss_trigger?: string;
    };
    boss?: {
        type: string;
        spawn_point: { x: number; y: number; };
    };
    rewards?: {
        unlock?: string | null;
        powerup_drop_rate_bonus?: number;
        achievement?: string;
    };
}

export interface MissionProgress {
    lastReset: number; // timestamp
    missions: Mission[];
    campaign: {
        unlockedMissions: string[];
        currentMission?: string;
        completedMissions: string[];
    };
}

export interface CampaignMission {
    id: string;
    name: string;
    description: string;
    objectives: {
        type: 'survival_timer' | 'elimination';
        duration_s?: number;
        enemy_total?: number;
        boss_trigger?: string;
    };
    waves: Array<{
        wave: number;
        enemies: Array<{
            type: string;
            count: number;
        }>;
    }>;
    boss?: {
        type: string;
        spawn_point: { x: number; y: number; };
    };
    rewards: {
        unlock?: string | null;
        powerup_drop_rate_bonus?: number;
        achievement?: string;
    };
}

/**
 * MissionManager handles all mission-related functionality
 * Includes daily/weekly mission generation, tracking, and completion
 */
export class MissionManager {
    private static instance: MissionManager;
    private scene: Phaser.Scene;
    private missions: Mission[] = [];
    private lastReset: number = 0;

    // Mission templates for daily missions
    private dailyMissionTemplates = [
        {
            title: "Coin Collector",
            description: "Collect {target} coins in one run",
            category: 'gold' as const,
            target: 100,
            rewardType: 'coins' as const,
            rewardAmount: 25
        },
        {
            title: "Biohazard Expert",
            description: "Defeat {target} enemies today",
            category: 'enemies' as const,
            target: 50,
            rewardType: 'coins' as const,
            rewardAmount: 30
        },
        {
            title: "Distance Runner",
            description: "Run {target} meters in one session",
            category: 'distance' as const,
            target: 2000,
            rewardType: 'gems' as const,
            rewardAmount: 5
        },
        {
            title: "Power Collector",
            description: "Collect {target} power-ups today",
            category: 'powerups' as const,
            target: 10,
            rewardType: 'coins' as const,
            rewardAmount: 20
        },
        {
            title: "Survival Master",
            description: "Survive for {target} seconds in one run",
            category: 'distance' as const,
            target: 300,
            rewardType: 'coins' as const,
            rewardAmount: 35
        }
    ];

    // Mission templates for weekly missions
    private weeklyMissionTemplates = [
        {
            title: "Weekly Warrior",
            description: "Defeat {target} enemies this week",
            category: 'enemies' as const,
            target: 500,
            rewardType: 'gems' as const,
            rewardAmount: 25
        },
        {
            title: "Distance Champion",
            description: "Run {target} meters total this week",
            category: 'distance' as const,
            target: 15000,
            rewardType: 'skin' as const,
            rewardAmount: 1 // Special skin
        },
        {
            title: "Coin Millionaire",
            description: "Collect {target} coins this week",
            category: 'gold' as const,
            target: 2000,
            rewardType: 'gems' as const,
            rewardAmount: 15
        },
        {
            title: "Power Master",
            description: "Collect {target} power-ups this week",
            category: 'powerups' as const,
            target: 50,
            rewardType: 'coins' as const,
            rewardAmount: 100
        }
    ];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.loadProgress();
        this.initializeMissionManager();

        MissionManager.instance = this;
    }

    public static getInstance(scene?: Phaser.Scene): MissionManager {
        if (!MissionManager.instance && scene) {
            MissionManager.instance = new MissionManager(scene);
        }
        return MissionManager.instance;
    }

    private initializeMissionManager(): void {
        // Check if missions need to be reset (new day/week)
        const now = Date.now();
        const needsReset = this.checkResetNeeded(now);

        if (needsReset) {
            this.generateNewMissions();
        }

        // Listen for mission-related events
        this.scene.events.on('mission-progress', this.handleMissionProgress, this);
    }

    private checkResetNeeded(now: number): boolean {
        const lastReset = new Date(this.lastReset);
        const today = new Date(now);

        // Daily reset at midnight
        if (lastReset.getDate() !== today.getDate() ||
            lastReset.getMonth() !== today.getMonth() ||
            lastReset.getFullYear() !== today.getFullYear()) {
            return true;
        }

        // Weekly reset check (Monday at midnight, but simplified for now)
        const daysSinceReset = Math.floor((now - this.lastReset) / (1000 * 60 * 60 * 24));
        if (daysSinceReset >= 7) {
            return true;
        }

        return false;
    }

    private generateNewMissions(): void {
        console.log('Generating new missions...');

        this.missions = [];
        const now = Date.now();

        // Generate daily missions (3-4 random)
        const dailyCount = Math.random() < 0.3 ? 3 : 4;
        const shuffledDaily = this.shuffleArray(this.dailyMissionTemplates);

        for (let i = 0; i < dailyCount && i < shuffledDaily.length; i++) {
            const template = shuffledDaily[i];
            const mission: Mission = {
                id: `daily_${Date.now()}_${i}`,
                title: template.title.trim().replace('{target}', template.target.toString()),
                description: template.description.trim().replace('{target}', template.target.toString()),
                type: 'daily',
                category: template.category,
                target: template.target,
                current: 0,
                rewardType: template.rewardType,
                rewardAmount: template.rewardAmount,
                isCompleted: false,
                isClaimed: false
            };

            this.missions.push(mission);
        }

        // Generate weekly mission (1 random, or 2 if unlocked)
        const weeklyCount = 1; // Could be more based on player progress
        const shuffledWeekly = this.shuffleArray(this.weeklyMissionTemplates);

        for (let i = 0; i < weeklyCount && i < shuffledWeekly.length; i++) {
            const template = shuffledWeekly[i];
            const mission: Mission = {
                id: `weekly_${Date.now()}_${i}`,
                title: template.title.trim().replace('{target}', template.target.toString()),
                description: template.description.trim().replace('{target}', template.target.toString()),
                type: 'weekly',
                category: template.category,
                target: template.target,
                current: 0,
                rewardType: template.rewardType,
                rewardAmount: template.rewardAmount,
                isCompleted: false,
                isClaimed: false
            };

            this.missions.push(mission);
        }

        this.lastReset = now;
        this.saveProgress();

        console.log(`Generated ${this.missions.length} missions`);
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Update mission progress based on player actions
     */
    public updateProgress(category: Mission['category'], amount: number = 1): void {
        this.missions.forEach(mission => {
            if (mission.category === category && !mission.isCompleted) {
                mission.current += amount;

                if (mission.current >= mission.target && !mission.isCompleted) {
                    mission.isCompleted = true;
                    this.emitMissionCompleted(mission);
                    console.log(`Mission completed: ${mission.title}`);
                }
            }
        });

        this.saveProgress();
    }

    /**
     * Get all active missions
     */
    public getAllMissions(): Mission[] {
        return this.missions.filter(mission => !mission.isClaimed);
    }

    /**
     * Get only daily missions
     */
    public getDailyMissions(): Mission[] {
        return this.missions.filter(mission => mission.type === 'daily' && !mission.isClaimed);
    }

    /**
     * Get only weekly missions
     */
    public getWeeklyMissions(): Mission[] {
        return this.missions.filter(mission => mission.type === 'weekly' && !mission.isClaimed);
    }

    /**
     * Get only completed missions ready for claiming
     */
    public getCompletedMissions(): Mission[] {
        return this.missions.filter(mission => mission.isCompleted && !mission.isClaimed);
    }

    /**
     * Claim reward for completed mission
     */
    public claimReward(missionId: string): boolean {
        const mission = this.missions.find(m => m.id === missionId);

        if (!mission || !mission.isCompleted || mission.isClaimed) {
            return false;
        }

        // Give reward
        this.giveReward(mission.rewardType, mission.rewardAmount);

        // Mark as claimed and save
        mission.isClaimed = true;
        this.saveProgress();

        // Emit event for UI updates
        this.scene.events.emit('mission-reward-claimed', mission);

        return true;
    }

    private giveReward(type: Mission['rewardType'], amount: number): void {
        // Emit events to give rewards
        switch (type) {
            case 'coins':
                this.scene.events.emit('add-coins', amount);
                console.log(`Rewarded ${amount} coins`);
                break;
            case 'gems':
                this.scene.events.emit('add-gems', amount);
                console.log(`Rewarded ${amount} gems`);
                break;
            case 'skin':
                this.scene.events.emit('unlock-skin', amount); // amount could represent skin ID
                console.log(`Rewarded skin: ${amount}`);
                break;
            case 'weapon':
                this.scene.events.emit('unlock-weapon', amount); // amount could represent weapon ID
                console.log(`Rewarded weapon: ${amount}`);
                break;
        }
    }

    private emitMissionCompleted(mission: Mission): void {
        this.scene.events.emit('mission-completed', mission);

        // Show notification (UI component would handle this)
        console.log(`🎉 Mission Completed: ${mission.title}`);
    }

    /**
     * Handle mission progress events
     */
    private handleMissionProgress(data: {
        category: Mission['category'];
        amount: number;
        source?: string;
    }): void {
        this.updateProgress(data.category, data.amount);
    }

    /**
     * Update all active mission progress based on game events
     * Called from game scenes to track various actions
     */
    public onCoinCollected(amount: number): void {
        this.updateProgress('gold', amount);
    }

    public onEnemiesDefeated(amount: number): void {
        this.updateProgress('enemies', amount);
    }

    public onDistanceRun(meters: number): void {
        this.updateProgress('distance', Math.floor(meters));
    }

    public onPowerUpCollected(): void {
        this.updateProgress('powerups', 1);
    }

    public onRunTime(seconds: number): void {
        // This could be a separate mission type, but for now we'll tie it to distance
        // You could add a new category for time/runs
    }

    /**
     * Save/Load progress using localStorage
     */
    private saveProgress(): void {
        try {
            const progress: MissionProgress = {
                lastReset: this.lastReset,
                missions: this.missions,
                campaign: {
                    unlockedMissions: this.getUnlockedCampaignMissions(),
                    currentMission: this.getCurrentCampaignMission(),
                    completedMissions: this.getCompletedCampaignMissions()
                }
            };

            localStorage.setItem('veggieClash_missions', JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save mission progress:', error);
        }
    }

    private loadProgress(): void {
        try {
            const saved = localStorage.getItem('veggieClash_missions');
            if (saved) {
                const progress: MissionProgress = JSON.parse(saved);
                this.missions = progress.missions;
                this.lastReset = progress.lastReset;

                // Remove old completed missions (cleanup)
                this.missions = this.missions.filter(mission =>
                    !mission.isClaimed || (Date.now() - this.lastReset < 7 * 24 * 60 * 60 * 1000)
                );
            } else {
                this.lastReset = 0;
            }
        } catch (error) {
            console.error('Failed to load mission progress:', error);
            this.lastReset = 0;
            this.missions = [];
        }
    }

    /**
     * Reset missions (for debugging or manual reset)
     */
    public resetAllMissions(): void {
        this.lastReset = 0;
        this.generateNewMissions();
    }

    /**
     * Get unlocked campaign missions from localStorage
     */
    private getUnlockedCampaignMissions(): string[] {
        try {
            const saved = localStorage.getItem('veggieClash_campaign_unlocked');
            return saved ? JSON.parse(saved) : ['mission_1']; // Start with first mission unlocked
        } catch (error) {
            console.error('Failed to load campaign unlocks:', error);
            return ['mission_1'];
        }
    }

    /**
     * Get current campaign mission ID
     */
    private getCurrentCampaignMission(): string | undefined {
        try {
            return localStorage.getItem('veggieClash_campaign_current') || undefined;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Get completed campaign missions
     */
    private getCompletedCampaignMissions(): string[] {
        try {
            const saved = localStorage.getItem('veggieClash_campaign_completed');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load campaign completion:', error);
            return [];
        }
    }

    /**
     * Load and return campaign missions from missions.json
     */
    public async loadCampaignMissions(): Promise<CampaignMission[]> {
        try {
            const response = await fetch('/data/missions.json');
            const data = await response.json();
            return data.missions || [];
        } catch (error) {
            console.error('Failed to load campaign missions:', error);
            return [];
        }
    }

    /**
     * Get campaign missions (wrapper for compatibility)
     */
    public getCampaignMissions(): Mission[] {
        return this.missions.filter(mission => mission.type === 'campaign');
    }

    /**
     * Start a campaign mission
     */
    public startCampaignMission(missionId: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                const campaignMissions = await this.loadCampaignMissions();
                const missionData = campaignMissions.find(m => m.id === missionId);

                if (!missionData) {
                    console.error(`Campaign mission ${missionId} not found`);
                    resolve(false);
                    return;
                }

                // Convert campaign mission to internal Mission format
                const mission: Mission = {
                    id: missionId,
                    title: missionData.name,
                    description: missionData.description,
                    type: 'campaign',
                    category: missionData.objectives.type === 'survival_timer' ? 'survival_timer' : 'elimination',
                    target: missionData.objectives.enemy_total || missionData.objectives.duration_s || 0,
                    current: 0,
                    rewardType: 'coins', // Basic reward (could be enhanced)
                    rewardAmount: 50,
                    isCompleted: false,
                    isClaimed: false,
                    waves: missionData.waves,
                    objectives: missionData.objectives,
                    boss: missionData.boss,
                    rewards: missionData.rewards
                };

                // Add to missions list if not already present
                const existingIndex = this.missions.findIndex(m => m.id === missionId);
                if (existingIndex >= 0) {
                    this.missions[existingIndex] = mission;
                } else {
                    this.missions.push(mission);
                }

                // Save current mission
                localStorage.setItem('veggieClash_campaign_current', missionId);

                this.saveProgress();
                this.scene.events.emit('campaign-mission-started', mission);

                console.log(`Started campaign mission: ${mission.title}`);
                resolve(true);
            } catch (error) {
                console.error('Failed to start campaign mission:', error);
                resolve(false);
            }
        });
    }

    /**
     * Complete a campaign mission and unlock the next one
     */
    public completeCampaignMission(missionId: string): boolean {
        const mission = this.missions.find(m => m.id === missionId && m.type === 'campaign');

        if (!mission || mission.isCompleted) {
            return false;
        }

        mission.isCompleted = true;
        mission.isClaimed = true; // Auto-claim campaign rewards

        // Save completion
        const completed = this.getCompletedCampaignMissions();
        if (!completed.includes(missionId)) {
            completed.push(missionId);
            localStorage.setItem('veggieClash_campaign_completed', JSON.stringify(completed));
        }

        // Unlock next mission
        const unlocked = this.getUnlockedCampaignMissions();
        if (mission.rewards?.unlock && !unlocked.includes(mission.rewards.unlock)) {
            unlocked.push(mission.rewards.unlock);
            localStorage.setItem('veggieClash_campaign_unlocked', JSON.stringify(unlocked));
        }

        this.saveProgress();
        this.scene.events.emit('campaign-mission-completed', mission);

        console.log(`Completed campaign mission: ${mission.title}`);
        return true;
    }

    /**
     * Check if a campaign mission is unlocked
     */
    public isCampaignMissionUnlocked(missionId: string): boolean {
        const unlocked = this.getUnlockedCampaignMissions();
        return unlocked.includes(missionId);
    }

    /**
     * Get mission completion statistics
     */
    public getStatistics(): {
        totalMissions: number;
        completedMissions: number;
        claimedRewards: number;
        totalCoinsEarned: number;
        totalGemsEarned: number;
    } {
        const stats = {
            totalMissions: this.missions.length,
            completedMissions: this.missions.filter(m => m.isCompleted).length,
            claimedRewards: this.missions.filter(m => m.isClaimed).length,
            totalCoinsEarned: this.missions
                .filter(m => m.isClaimed && m.rewardType === 'coins')
                .reduce((sum, m) => sum + m.rewardAmount, 0),
            totalGemsEarned: this.missions
                .filter(m => m.isClaimed && m.rewardType === 'gems')
                .reduce((sum, m) => sum + m.rewardAmount, 0)
        };

        return stats;
    }

    /**
     * Debug method to print current mission status
     */
    public debugPrintMissions(): void {
        console.log('Current Missions:');
        this.missions.forEach((mission, index) => {
            console.log(`${index + 1}. [${mission.type.toUpperCase()}] ${mission.title}`);
            console.log(`   Progress: ${mission.current}/${mission.target}`);
            console.log(`   Completed: ${mission.isCompleted}, Claimed: ${mission.isClaimed}`);
            console.log(`   Reward: ${mission.rewardAmount} ${mission.rewardType}`);
            console.log('');
        });
    }

    /**
     * Cleanup method
     */
    public destroy(): void {
        this.scene.events.off('mission-progress', this.handleMissionProgress, this);

        if (MissionManager.instance === this) {
            MissionManager.instance = null as any;
        }
    }
}

export default MissionManager;
