import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource } from '@angular/material/tree';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupedEntities, ModelMappingState } from '../../../shared/state/diffs-state';
import { EntityNode, FlatTreeNode, TreeService } from '../tree-service';


@Component({
  selector: 'app-lost-items',
  templateUrl: './lost-items.component.html',
  styleUrls: ['./lost-items.component.scss']
})
export class LostItemsComponent implements OnInit, OnDestroy {

  treeControl = new FlatTreeControl<FlatTreeNode>(node => node.level, node => node.expandable);
  dataSource: MatTreeFlatDataSource<EntityNode, FlatTreeNode>;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<FlatTreeNode>(true /* multiple */);

  private destroy$ = new Subject<void>();

  @Select(ModelMappingState.lostEntitiesByType) lost$: Observable<GroupedEntities[]>;

  constructor(public treeService: TreeService) {
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeService.treeFlattener);
    this.lost$.pipe(takeUntil(this.destroy$)).subscribe(s => {

      this.dataSource.data = treeService.buildTreeFromEntities(s, "Lost items");
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  leafItemSelectionToggle(node: FlatTreeNode): void {
    this.treeService.leafItemSelectionToggle(this.treeControl, this.checklistSelection, node);
  }

  itemSelectionToggle(node: FlatTreeNode): void {
    this.treeService.itemSelectionToggle(this.treeControl, this.checklistSelection, node);
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: FlatTreeNode): boolean {
    return this.treeService.descendantsAllSelected(this.treeControl, this.checklistSelection, node);
  }
  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FlatTreeNode): boolean {
    return this.treeService.descendantsPartiallySelected(this.treeControl, this.checklistSelection, node);
  }

  zoomTo(node: FlatTreeNode) {
    this.treeService.zoomTo(node);
  }
}